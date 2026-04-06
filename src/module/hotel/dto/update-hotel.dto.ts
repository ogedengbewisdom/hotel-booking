// import { PartialType } from '@nestjs/mapped-types';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateHotelDto } from './create-hotel.dto';

export class UpdateHotelDto extends PartialType(
  OmitType(CreateHotelDto, ['totalRooms'] as const),
) {}
