import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingStatus } from './enums/booking-status';
import { TransformParamsPipe } from '../../common/pipe/transform-params/transform-params.pipe';
import { RoleGuard } from '../../common/guard/role-guard/role.guard';
import { UserRole } from '../users/enums/user-role';
import { Roles } from '../../common/decorator/roles.decorator';
import type { IBookingQuery } from '../../common/interface/hotel.query';
import { FeedbackDto } from './dto/feedback.dto';
import { ReasonDto } from './dto/reason.dto';

@Controller({ path: 'booking', version: '1' })
@ApiTags('Booking')
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('hotel/:hotel_id')
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBody({ type: CreateBookingDto, description: 'The booking data' })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @ApiResponse({ status: 201, description: 'Created' })
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const booking = await this.bookingService.create(
      createBookingDto,
      hotel_id,
      user_id,
    );
    return {
      message: 'Booking created successfully please proceed to payment',
      data: booking,
    };
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all bookings by admin with pagination and search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookingStatus,
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'hotel_id',
    required: false,
    type: Number,
  })
  @Get('admin')
  async findAll(@Query() query: IBookingQuery) {
    const bookings = await this.bookingService.findAll(query);
    return {
      message: 'Bookings fetched successfully',
      data: bookings,
    };
  }

  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get a booking by admin' })
  @ApiParam({ name: 'id', description: 'The booking ID', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('admin/:id')
  async findOne(@Param('id', TransformParamsPipe) id: number) {
    const booking = await this.bookingService.findOne(id);
    return {
      message: 'Booking fetched successfully',
      data: booking,
    };
  }

  @ApiOperation({
    summary: 'Get all bookings by self with pagination and search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: BookingStatus,
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    type: Date,
  })
  @ApiQuery({
    name: 'hotel_id',
    required: false,
    type: Number,
  })
  @Get('user')
  async findAllByUser(@Query() query: IBookingQuery, @Request() req) {
    const user_id = Number(req.user?.sub);
    const bookings = await this.bookingService.find_user_bookings(
      query,
      user_id,
    );
    return {
      message: 'Bookings fetched successfully',
      data: bookings,
    };
  }

  @ApiOperation({ summary: 'Get a booking by self' })
  @ApiParam({ name: 'id', description: 'The booking ID', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @Get('user/:id')
  async findOneByUser(
    @Param('id', TransformParamsPipe) id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const booking = await this.bookingService.find_user_booking(id, user_id);
    return {
      message: 'Booking fetched successfully',
      data: booking,
    };
  }

  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiParam({ name: 'id', description: 'The booking ID', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id')
  async cancelBooking(
    @Param('id', TransformParamsPipe) id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const user_role = req.user?.role as UserRole;
    const booking = await this.bookingService.cancel_booking(
      id,
      user_id,
      user_role,
    );
    return {
      message: 'Booking cancelled successfully',
      data: booking,
    };
  }

  @ApiOperation({ summary: 'Abandon a booking' })
  @ApiParam({ name: 'id', description: 'The booking ID', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @Delete(':id/abandon')
  async abandonBooking(
    @Param('id', TransformParamsPipe) id: number,
    @Request() req,
    @Body() reason_dto: ReasonDto,
  ) {
    const user_id = Number(req.user?.sub);
    const user_role = req.user?.role as UserRole;
    const booking = await this.bookingService.abandon_booking(
      id,
      user_id,
      user_role,
      reason_dto,
    );
    return {
      message: 'Booking abandoned successfully',
      data: {
        booking_id: booking.id,
        abandoned_reason: booking.abandoned_reason,
        status: booking.status,
      },
    };
  }

  @ApiOperation({ summary: 'Feedback a booking' })
  @ApiParam({ name: 'id', description: 'The booking ID', type: Number })
  @ApiResponse({ status: 200, description: 'Success' })
  @Post(':id/feedback')
  async feedbackBooking(
    @Param('id', TransformParamsPipe) id: number,
    @Request() req,
    @Body() feedback_dto: FeedbackDto,
  ) {
    const user_id = Number(req.user?.sub);
    const user_role = req.user?.role as UserRole;
    const booking = await this.bookingService.feedback_booking(
      id,
      user_id,
      user_role,
      feedback_dto,
    );
    return {
      message: 'Booking feedbacked successfully',
      data: {
        booking_id: booking.id,
        feedback: booking.feedback,
      },
    };
  }
}
