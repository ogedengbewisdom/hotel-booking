import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John', description: 'The first name of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  first_name: string;

  @ApiProperty({ example: 'Doe', description: 'The last name of the user' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  last_name: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'The password of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Phone number must be in international format',
  })
  phone_number: string;
}
