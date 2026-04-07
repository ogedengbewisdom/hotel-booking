import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReasonDto {
  @ApiProperty({
    example: 'I have changed my mind',
    description: 'The reason for abandoning the booking',
  })
  @IsString()
  @IsNotEmpty()
  abandoned_reason: string;
}
