import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateHotelDto {
  @ApiProperty({ example: 'Hotel Name', description: 'The name of the hotel' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '123 Main St',
    description: 'The address of the hotel',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'California', description: 'The state of the hotel' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({
    example: 'United States',
    description: 'The country of the hotel',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    example: 'This is a description of the hotel',
    description: 'The description of the hotel',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    description: 'The images of the hotel',
  })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    example: 10,
    description: 'The total number of rooms in the hotel',
  })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  totalRooms: number;
}
