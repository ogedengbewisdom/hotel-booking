import { Injectable } from '@nestjs/common';
import { CreateBookedRoomDto } from './dto/create-booked_room.dto';
import { UpdateBookedRoomDto } from './dto/update-booked_room.dto';

@Injectable()
export class BookedRoomsService {
  create(createBookedRoomDto: CreateBookedRoomDto) {
    return 'This action adds a new bookedRoom';
  }

  findAll() {
    return `This action returns all bookedRooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookedRoom`;
  }

  update(id: number, updateBookedRoomDto: UpdateBookedRoomDto) {
    return `This action updates a #${id} bookedRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookedRoom`;
  }
}
