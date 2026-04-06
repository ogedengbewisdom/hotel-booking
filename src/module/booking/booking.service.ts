import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import {
  Between,
  DataSource,
  FindOptionsWhere,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Hotel } from '../hotel/entities/hotel.entity';
import { HotelRoom } from '../hotel_rooms/entities/hotel_room.entity';
import { BookedRoom } from '../booked_rooms/entities/booked_room.entity';
import { BookingStatus } from './enums/booking-status';
import { convert_to_naira } from '../../util/lib';
import type { IBookingQuery } from '../../common/interface/hotel.query';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private booking_repository: Repository<Booking>,
    private readonly data_source: DataSource,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    hotel_id: number,
    user_id: number,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start_date = new Date(createBookingDto.start_date);
    const end_date = new Date(createBookingDto.end_date);
    // end_date.setHours(12, 0, 0, 0);

    if (start_date < today)
      throw new BadRequestException('Start date cannot be in the past');

    if (end_date < today)
      throw new BadRequestException('End date cannot be in the past');

    const min_end_date = new Date(start_date);
    min_end_date.setDate(min_end_date.getDate() + 1);

    if (end_date < min_end_date)
      throw new BadRequestException(
        'End date must be at least one day after start date',
      );

    try {
      return this.data_source.transaction(async (txn) => {
        const hotel = await txn.findOne(Hotel, { where: { id: hotel_id } });
        if (!hotel) throw new NotFoundException('Hotel not found');

        if (!hotel.is_active)
          throw new BadRequestException('Hotel is not available');

        const rooms = await txn.find(HotelRoom, {
          where: {
            id: In(createBookingDto.room_ids),
            hotel_id,
            is_active: true,
          },
        });

        if (rooms.length !== createBookingDto.room_ids.length)
          throw new BadRequestException('Some rooms are not available');

        const booked_rooms = await txn
          .getRepository(BookedRoom)
          .createQueryBuilder('br')
          .innerJoin('br.booking', 'booking')
          .where('br.room_id IN (:...roomIds)', {
            roomIds: createBookingDto.room_ids,
          })
          .andWhere('booking.status = :status', {
            status: BookingStatus.CONFIRMED,
          })
          .andWhere('booking.start_date < :end_date', {
            end_date: end_date,
          })
          .andWhere('booking.end_date > :start_date', {
            start_date: start_date,
          })
          .select(['br.room_id'])
          .getMany();

        if (booked_rooms.length > 0) {
          const booked_room_ids = booked_rooms.map((room) => room.room_id);
          throw new BadRequestException(
            `These rooms are already booked for this period: ${booked_room_ids.join(', ')}. Please select different rooms or dates.`,
          );
        }

        const num_of_days = Math.ceil(
          (end_date.getTime() - start_date.getTime()) / (1000 * 60 * 60 * 24),
        );

        const total_price = rooms.reduce(
          (acc, room) => acc + room.price_per_night * num_of_days,
          0,
        );

        const booking = txn.create(Booking, {
          start_date,
          end_date,
          total_price,
          user_id,
          hotel_id,
        });

        const saved_booking = await txn.save(booking);

        const saved_booked_rooms: BookedRoom[] = [];

        for (let i = 0; i < createBookingDto.room_ids.length; i++) {
          saved_booked_rooms.push(
            txn.create(BookedRoom, {
              booking_id: saved_booking.id,
              room_id: createBookingDto.room_ids[i],
            }),
          );
        }

        await txn.save(saved_booked_rooms);

        const {
          total_price: cost,
          deleted_at,
          updated_at,
          abandoned_reason,
          feedback,
          // user_id,
          ...rest
        } = saved_booking;

        return { ...rest, total_price: convert_to_naira(cost) };
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Internal server error',
      );
    }
  }

  async findAll(query: IBookingQuery) {
    const {
      page = 1,
      limit = 10,
      status,
      start_date,
      end_date,
      hotel_id,
    } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Booking> = {};
    if (status) where.status = status as BookingStatus;
    if (hotel_id) where.hotel_id = hotel_id;
    if (start_date && end_date) {
      where.created_at = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.created_at = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      where.created_at = LessThanOrEqual(new Date(end_date));
    }

    try {
      const [data, total] = await this.booking_repository.findAndCount({
        where,
        skip,
        take: limit,
        relations: ['hotel', 'booked_rooms', 'user', 'payment'],
      });

      const mapped_data = data.map((booking) => {
        const {
          deleted_at,
          total_price,
          hotel,
          booked_rooms,
          user,
          payment,
          ...rest
        } = booking;
        return {
          ...rest,
          total_price: convert_to_naira(total_price),
          hotel: hotel.name,
          user: user.first_name + ' ' + user.last_name,
          phone_number: user.phone_number,
          email: user.email,
          user_id: user.id,
          booked_rooms: booked_rooms.map((booked_room) => booked_room.room_id),
          ...(payment && { payment_amount: convert_to_naira(payment.amount) }),
          ...(payment && { payment_status: payment.status }),
        };
      });
      return {
        data: mapped_data,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch bookings',
      );
    }
  }
  async findOne(id: number) {
    const booking = await this.booking_repository.findOne({
      where: { id },
      relations: ['hotel', 'booked_rooms', 'user', 'payment'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const {
      deleted_at,
      total_price,
      hotel,
      booked_rooms,
      user,
      payment,
      ...rest
    } = booking;
    return {
      ...rest,
      total_price: convert_to_naira(total_price),
      hotel: hotel.name,
      user: user.first_name + ' ' + user.last_name,
      user_id: user.id,
      phone_number: user.phone_number,
      email: user.email,
      booked_rooms: booked_rooms.map((booked_room) => booked_room.room_id),
      ...(payment && { payment_amount: convert_to_naira(payment.amount) }),
      ...(payment && { payment_status: payment.status }),
    };
  }

  async find_user_bookings(query: IBookingQuery, user_id: number) {
    const {
      page = 1,
      limit = 10,
      status,
      start_date,
      end_date,
      hotel_id,
    } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<Booking> = { user_id };
    if (status) where.status = status as BookingStatus;
    if (hotel_id) where.hotel_id = hotel_id;
    if (start_date && end_date) {
      where.created_at = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.created_at = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      where.created_at = LessThanOrEqual(new Date(end_date));
    }

    const [data, total] = await this.booking_repository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['hotel', 'booked_rooms', 'user', 'payment'],
    });

    const mapped_data = data.map((booking) => {
      const {
        deleted_at,
        total_price,
        hotel,
        booked_rooms,
        user,
        payment,
        ...rest
      } = booking;

      return {
        ...rest,
        total_price: convert_to_naira(total_price),
        hotel: hotel.name,
        user: user.first_name + ' ' + user.last_name,
        user_id: user.id,
        booked_rooms: booked_rooms.map((booked_room) => booked_room.room_id),
        ...(payment && { payment_amount: convert_to_naira(payment.amount) }),
        ...(payment && { payment_status: payment.status }),
      };
    });
    return {
      data: mapped_data,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  async find_user_booking(id: number, user_id: number) {
    const booking = await this.booking_repository.findOne({
      where: { id, user_id },
      relations: ['hotel', 'booked_rooms', 'user', 'payment'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    const {
      deleted_at,
      total_price,
      hotel,
      booked_rooms,
      user,
      payment,
      ...rest
    } = booking;
    return {
      ...rest,
      total_price: convert_to_naira(total_price),
      hotel: hotel.name,
      user: user.first_name + ' ' + user.last_name,
      user_id: user.id,
      booked_rooms: booked_rooms.map((booked_room) => booked_room.room_id),
      ...(payment && { payment_amount: convert_to_naira(payment.amount) }),
      ...(payment && { payment_status: payment.status }),
    };
  }
}
