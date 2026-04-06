import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from './entities/hotel.entity';
import { HotelRoom } from '../hotel_rooms/entities/hotel_room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hotel, HotelRoom])],
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
})
export class HotelModule {}
