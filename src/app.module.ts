import { MiddlewareConsumer, Module } from '@nestjs/common';
// import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReqLoggerMiddleware } from './common/middleware/req-logger/req-logger.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './module/auth/auth.module';
import { UsersModule } from './module/users/users.module';
import { HotelModule } from './module/hotel/hotel.module';
import { BookingModule } from './module/booking/booking.module';
import { BookedRoomsModule } from './module/booked_rooms/booked_rooms.module';
import { HotelRoomsModule } from './module/hotel_rooms/hotel_rooms.module';
import { PaymentModule } from './module/payment/payment.module';
import { DashboardModule } from './module/dashboard/dashboard.module';

const devMode = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: parseInt(config.get('DB_PORT', '5432'), 10),
        username: config.get('DB_USERNAME', 'postgres'),
        password: config.get('DB_PASSWORD', '1234'),
        database: config.get('DB_NAME', 'hotel_booking_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: devMode,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    HotelModule,
    BookingModule,
    BookedRoomsModule,
    HotelRoomsModule,
    PaymentModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ReqLoggerMiddleware).forRoutes('*');
  }
}
