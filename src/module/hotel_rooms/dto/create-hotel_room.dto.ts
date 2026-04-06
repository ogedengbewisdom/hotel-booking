import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsUrl,
  Min,
} from 'class-validator';
import { RoomType } from '../enum/hotel-type';
import { ApiProperty } from '@nestjs/swagger';
export class CreateHotelRoomDto {
  @ApiProperty({ example: 1, description: 'The room number of the hotel room' })
  @IsInt()
  @Min(1)
  room_number: number;

  @ApiProperty({ example: 1, description: 'The floor of the hotel room' })
  @IsInt()
  @Min(1)
  @IsOptional()
  floor?: number;

  @ApiProperty({
    example: RoomType.SINGLE,
    description: 'The type of the hotel room',
  })
  @IsEnum(RoomType)
  room_type: RoomType;

  @ApiProperty({
    example: 100,
    description: 'The price per night of the hotel room',
  })
  @IsInt()
  @Min(1)
  price_per_night: number;

  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'The images of the hotel room',
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];
}
