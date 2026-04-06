import { PartialType } from '@nestjs/swagger';
import { CreateBookedRoomDto } from './create-booked_room.dto';

export class UpdateBookedRoomDto extends PartialType(CreateBookedRoomDto) {}
