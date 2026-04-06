import { Module } from '@nestjs/common';
import { HotelRoomsService } from './hotel_rooms.service';
import { HotelRoomsController } from './hotel_rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelRoom } from './entities/hotel_room.entity';
import { Hotel } from '../hotel/entities/hotel.entity';
import { HotelModule } from '../hotel/hotel.module';

@Module({
  imports: [TypeOrmModule.forFeature([HotelRoom, Hotel]), HotelModule],
  controllers: [HotelRoomsController],
  providers: [HotelRoomsService],
})
export class HotelRoomsModule {}
