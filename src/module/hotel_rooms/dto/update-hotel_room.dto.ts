import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHotelRoomDto } from './create-hotel_room.dto';

export class UpdateHotelRoomDto extends PartialType(
  OmitType(CreateHotelRoomDto, ['room_number'] as const),
) {}
