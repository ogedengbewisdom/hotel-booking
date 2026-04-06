import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TransformParamsPipe } from '../../common/pipe/transform-params/transform-params.pipe';
import { Public } from '../../common/decorator/public.decorator';

@ApiTags('Payment')
@Controller({ path: 'booking/:booking_id/payment', version: '1' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Public()
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiBody({ type: CreatePaymentDto, description: 'The payment data' })
  @ApiParam({ name: 'booking_id', description: 'The booking ID', type: Number })
  @ApiResponse({ status: 201, description: 'Payment created successfully' })
  @Post()
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
    @Param('booking_id', TransformParamsPipe) booking_id: number,
  ) {
    const payment = await this.paymentService.create(
      createPaymentDto,
      booking_id,
    );
    return {
      message: 'Payment successful and hotel booking confirmed',
      data: payment,
    };
  }
}
