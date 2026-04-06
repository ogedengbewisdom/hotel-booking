import { Module } from '@nestjs/common';
import { BookedRoomsService } from './booked_rooms.service';
import { BookedRoomsController } from './booked_rooms.controller';
import { BookedRoom } from './entities/booked_room.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([BookedRoom])],
  controllers: [BookedRoomsController],
  providers: [BookedRoomsService],
  exports: [BookedRoomsService],
})
export class BookedRoomsModule {}
