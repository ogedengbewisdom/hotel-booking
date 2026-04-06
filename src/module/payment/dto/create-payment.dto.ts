import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    example: 1000,
    description: 'The amount of the payment',
  })
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  amount: number;
}
