import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsPositive,
} from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    example: '2026-01-01',
    description: 'The start date of the booking',
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    example: '2026-01-07',
    description: 'The end date of the booking',
  })
  @IsDateString()
  end_date: string;

  @ApiProperty({
    example: [1, 2, 3],
    description: 'The room ids of the booking',
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  room_ids: number[];
}
