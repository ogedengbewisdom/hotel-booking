import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookedRoom } from '../booked_rooms/entities/booked_room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookedRoom])],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
