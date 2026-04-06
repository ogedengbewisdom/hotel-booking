import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHotelRoomDto } from './dto/create-hotel_room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel_room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HotelRoom } from './entities/hotel_room.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Hotel } from '../hotel/entities/hotel.entity';
import type { IHotelRoomQuery } from '../../common/interface/hotel.query';
import { RoomType } from './enum/hotel-type';
import { HotelService } from '../hotel/hotel.service';
import { convert_to_kobo, convert_to_naira } from '../../util/lib';

@Injectable()
export class HotelRoomsService {
  constructor(
    @InjectRepository(HotelRoom)
    private hotel_room_repository: Repository<HotelRoom>,
    @InjectRepository(Hotel)
    private hotel_repository: Repository<Hotel>,
    private hotel_service: HotelService,
  ) {}

  async find_hotel_rooms(hotel_id: number, query: IHotelRoomQuery) {
    const { roomType: room_type, page = 1, limit = 10, floor } = query;

    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<HotelRoom> = { hotel_id };

    if (room_type) where.room_type = room_type as RoomType;

    if (floor) where.floor = floor;

    const hotel = await this.hotel_service.findOne(hotel_id);

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
      });

      const mapped_data = data.map((room) => {
        const { created_at, updated_at, deleted_at, hotel_id, ...rest } = room;
        return rest;
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

  async find_hotel_room(room_number: number, hotel_id: number) {
    try {
      return await this.hotel_room_repository.findOne({
        where: { hotel_id, room_number },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch hotel room',
      );
    }
  }

  async find_hotel_room_by_id(room_id: number) {
    try {
      const room = await this.hotel_room_repository.findOne({
        where: { id: room_id },
      });
      if (!room) throw new NotFoundException('Hotel room not found');

      const { created_at, updated_at, deleted_at, price_per_night, ...rest } =
        room;

      return { ...rest, price_per_night: convert_to_naira(price_per_night) };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to fetch hotel room',
      );
    }
  }

  async create_hotel_room(
    createHotelRoomDto: CreateHotelRoomDto,
    hotel_id: number,
    user_id: number,
  ) {
    const { price_per_night, ...rest } = createHotelRoomDto;
    const hotel = await this.hotel_service.findOne(hotel_id);
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to create a hotel room for this hotel',
      );

    const hotel_room = await this.find_hotel_room(
      createHotelRoomDto.room_number,
      hotel_id,
    );
    if (hotel_room) throw new BadRequestException('Hotel room already exists');

    try {
      const new_hotel_room = this.hotel_room_repository.create({
        ...rest,
        price_per_night: convert_to_kobo(price_per_night),
        hotel_id,
      });

      await this.hotel_room_repository.save(new_hotel_room);
      return new_hotel_room;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create hotel room',
      );
    }
  }

  async update_hotel_room(
    hotel_id: number,
    room_number: number,
    updateHotelRoomDto: UpdateHotelRoomDto,
    user_id: number,
  ) {
    const { price_per_night, ...rest } = updateHotelRoomDto;
    const hotel = await this.hotel_service.findOne(hotel_id);
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to update this hotel room',
      );

    const hotel_room = await this.find_hotel_room(room_number, hotel_id);

    if (!hotel_room) throw new NotFoundException('Hotel room not found');

    try {
      await this.hotel_room_repository.update(hotel_room.id, {
        ...rest,
        ...(price_per_night && {
          price_per_night: convert_to_kobo(price_per_night),
        }),
      });
      const updated_hotel_room = await this.find_hotel_room(
        room_number,
        hotel_id,
      );

      if (!updated_hotel_room)
        throw new NotFoundException('Hotel room not found');

      const {
        // created_at,
        // updated_at,
        deleted_at,
        // hotel_id,
        price_per_night: price_per_night_kobo,
        ...rest_hotel_room
      } = updated_hotel_room;
      return {
        ...rest_hotel_room,
        price_per_night: convert_to_naira(price_per_night_kobo),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to update hotel room',
      );
    }
  }

  async remove_hotel_room(hotel_id: number, room_id: number, user_id: number) {
    const hotel = await this.hotel_service.findOne(hotel_id);
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to delete this hotel room',
      );

    const hotel_room = await this.hotel_room_repository.findOne({
      where: { id: room_id, hotel_id },
    });
    if (!hotel_room) throw new NotFoundException('Hotel room not found');

    try {
      await this.hotel_room_repository.softDelete(hotel_room.id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to delete hotel room',
      );
    }
  }

  async change_hotel_room_status(
    hotel_id: number,
    room_id: number,
    user_id: number,
  ) {
    const hotel = await this.hotel_service.findOne(hotel_id);
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to change the status of this hotel room',
      );

    const hotel_room = await this.hotel_room_repository.findOne({
      where: { id: room_id, hotel_id },
    });
    if (!hotel_room) throw new NotFoundException('Hotel room not found');

    try {
      await this.hotel_room_repository.update(hotel_room.id, {
        is_active: !hotel_room.is_active,
      });
      return await this.find_hotel_room(hotel_room.room_number, hotel_id);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to change hotel room status',
      );
    }
  }

  async restore_hotel_room(hotel_id: number, room_id: number, user_id: number) {
    const hotel = await this.hotel_service.findOne(hotel_id);
    if (!hotel) throw new NotFoundException('Hotel not found');

    if (hotel.admin_id !== user_id)
      throw new ForbiddenException(
        'You are not authorized to restore this hotel room',
      );

    const hotel_room = await this.hotel_room_repository.findOne({
      where: { id: room_id, hotel_id },
      withDeleted: true,
    });
    if (!hotel_room) throw new NotFoundException('Hotel room not found');

    if (!hotel_room.deleted_at)
      throw new BadRequestException('Hotel room is not deleted');

    try {
      await this.hotel_room_repository.restore(room_id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to restore hotel room',
      );
    }
  }
}
