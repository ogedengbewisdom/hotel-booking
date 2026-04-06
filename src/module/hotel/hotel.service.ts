import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { DataSource, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { Hotel } from './entities/hotel.entity';
import { HotelRoom } from '../hotel_rooms/entities/hotel_room.entity';
import { RoomType } from '../hotel_rooms/enum/hotel-type';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IHotelQuery,
  IHotelRoomQuery,
} from '../../common/interface/hotel.query';
import { convert_to_naira } from '../../util/lib';

@Injectable()
export class HotelService {
  constructor(
    private readonly data_source: DataSource,
    @InjectRepository(Hotel) private hotel_repository: Repository<Hotel>,
    @InjectRepository(HotelRoom)
    private hotel_room_repository: Repository<HotelRoom>,
  ) {}
  create(createHotelDto: CreateHotelDto, user_id: number) {
    const { totalRooms, ...rest } = createHotelDto;
    try {
      return this.data_source.transaction(async (txn) => {
        const hotel = txn.create(Hotel, {
          ...rest,
          total_rooms: totalRooms,
          admin_id: user_id,
          created_by: { id: user_id },
        });

        const saved_hotel = await txn.save(hotel);

        // create hotel rooms

        const rooms: HotelRoom[] = [];

        for (let i = 1; i <= totalRooms; i++) {
          rooms.push(
            txn.create(HotelRoom, {
              room_number: i,
              hotel_id: saved_hotel.id,
              floor: 1,
              room_type: RoomType.SINGLE,
              price_per_night: 100,
            }),
          );
        }

        await txn.save(rooms);

        return saved_hotel;
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to create hotel',
      );
    }
  }

  async findAll(query: IHotelQuery) {
    const { search, page = 1, limit = 10 } = query;

    // const skip = (page - 1 || 0) * (limit || 10);
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Hotel>[] = search
      ? [
          {
            name: ILike(`%${search}%`),
            state: ILike(`%${search}%`),
            country: ILike(`%${search}%`),
          },
        ]
      : [];

    try {
      const [data, total] = await this.hotel_repository.findAndCount({
        where,
        skip,
        take: limit,
        // relations: ['rooms', 'created_by'],
      });

      const mapped_data = data.map((hotel) => {
        const {
          created_by,
          rooms,
          created_at,
          updated_at,
          deleted_at,
          admin_id,
          total_rooms,
          ...rest
        } = hotel;
        return rest;
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
        error?.message || 'Failed to fetch hotels',
      );
    }
  }

  async findOne(id: number) {
    try {
      return await this.hotel_repository.findOne({ where: { id } });
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch hotel',
      );
    }
  }

  async find_hotel_rooms(hotel_id: number, query: IHotelRoomQuery) {
    const { roomType: room_type, page = 1, limit = 10, floor } = query;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<HotelRoom> = { hotel_id };

    if (room_type) where.room_type = room_type as RoomType;

    if (floor) where.floor = floor;

    const hotel = await this.findOne(hotel_id);

    if (!hotel) throw new NotFoundException('Hotel not found');
    try {
      const {
        created_by,
        created_at,
        updated_at,
        deleted_at,
        admin_id,
        total_rooms,
        ...rest
      } = hotel;

      const [data, total] = await this.hotel_room_repository.findAndCount({
        where,
        skip,
        take: limit,
        order: { room_number: 'ASC' },
      });

      const mapped_data = data.map((room) => {
        const {
          created_at,
          updated_at,
          deleted_at,
          hotel_id,
          price_per_night,
          ...rest
        } = room;
        return { ...rest, price_per_night: convert_to_naira(price_per_night) };
      });

      return {
        ...rest,
        hotelRooms: mapped_data,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch hotel',
      );
    }
  }

  async update_hotel(
    id: number,
    updateHotelDto: UpdateHotelDto,
    user_id: number,
  ) {
    const hotel = await this.findOne(id);
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to update this hotel',
      );
    try {
      await this.hotel_repository.update(id, { ...updateHotelDto });
      return await this.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to update hotel',
      );
    }
  }

  async remove_hotel(id: number, user_id: number) {
    const hotel = await this.findOne(id);
    if (!hotel) throw new NotFoundException('Hotel not found');
    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to delete this hotel',
      );
    try {
      await this.hotel_repository.softDelete(id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete hotel',
      );
    }
  }

  async change_hotel_status(hotel_id: number, user_id: number) {
    const hotel = await this.findOne(hotel_id);
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to change the status of this hotel',
      );

    try {
      await this.hotel_repository.update(hotel_id, {
        is_active: !hotel.is_active,
      });
      return await this.findOne(hotel_id);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to change hotel status',
      );
    }
  }

  async restore_hotel(hotel_id: number) {
    const hotel = await this.hotel_repository.findOne({
      where: { id: hotel_id },
      withDeleted: true,
    });
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (!hotel.deleted_at)
      throw new BadRequestException('Hotel is not deleted');

    try {
      await this.hotel_repository.restore(hotel_id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to restore hotel',
      );
    }
  }
}
