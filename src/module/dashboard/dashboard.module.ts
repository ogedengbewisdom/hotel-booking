import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { User } from '../users/entities/user.entity';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
  imports: [TypeOrmModule.forFeature([Booking, User])],
})
export class DashboardModule {}
