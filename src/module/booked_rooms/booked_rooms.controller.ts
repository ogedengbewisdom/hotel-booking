import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BookedRoomsService } from './booked_rooms.service';
import { CreateBookedRoomDto } from './dto/create-booked_room.dto';
import { UpdateBookedRoomDto } from './dto/update-booked_room.dto';

@Controller('booked-rooms')
export class BookedRoomsController {
  constructor(private readonly bookedRoomsService: BookedRoomsService) {}

  // @Post()
  // create(@Body() createBookedRoomDto: CreateBookedRoomDto) {
  //   return this.bookedRoomsService.create(createBookedRoomDto);
  // }

  // @Get()
  // findAll() {
  //   return this.bookedRoomsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.bookedRoomsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateBookedRoomDto: UpdateBookedRoomDto,
  // ) {
  //   return this.bookedRoomsService.update(+id, updateBookedRoomDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.bookedRoomsService.remove(+id);
  // }
}
