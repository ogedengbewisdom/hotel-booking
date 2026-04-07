import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FeedbackDto {
  @ApiProperty({
    example: 'The hotel was great',
    description: 'The feedback for the booking',
  })
  @IsString()
  @IsNotEmpty()
  feedback: string;
}
