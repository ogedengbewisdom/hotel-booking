import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DataSource } from 'typeorm';
import { Booking } from '../booking/entities/booking.entity';
import { Payment } from './entities/payment.entity';
import { BookingStatus } from '../booking/enums/booking-status';
import { convert_to_kobo, convert_to_naira } from 'src/util/lib';
import { PaymentStatus } from './enum/payment.status';
import { BookedRoom } from '../booked_rooms/entities/booked_room.entity';

@Injectable()
export class PaymentService {
  constructor(private readonly data_source: DataSource) {}

  async create(createPaymentDto: CreatePaymentDto, booking_id: number) {
    const { amount } = createPaymentDto;
    const payment_amount = convert_to_kobo(amount);

    try {
      return this.data_source.transaction(async (txn) => {
        const booking = await txn.findOne(Booking, {
          where: { id: booking_id },
          relations: ['booked_rooms'],
        });
        if (!booking) throw new NotFoundException('Booking not found');

        if (booking.status !== BookingStatus.DRAFT)
          throw new BadRequestException(
            'Booking has been confirmed or abandoned',
          );

        if (booking.total_price !== payment_amount)
          throw new BadRequestException(
            'Amount does not match the booking total price',
          );

        console.log(booking);

        const booked_rooms = await txn
          .getRepository(BookedRoom)
          .createQueryBuilder('br')
          .innerJoin('br.booking', 'booking')
          .where('br.room_id IN (:...roomIds)', {
            roomIds: booking.booked_rooms.map(
              (booked_room) => booked_room.room_id,
            ),
          })
          .andWhere('booking.status = :status', {
            status: BookingStatus.CONFIRMED,
          })
          .andWhere('booking.start_date < :end_date', {
            end_date: booking.end_date,
          })
          .andWhere('booking.end_date > :start_date', {
            start_date: booking.start_date,
          })
          .select(['br.room_id'])
          .getMany();

        if (booked_rooms.length > 0) {
          const booked_room_ids = booked_rooms.map((room) => room.room_id);
          throw new BadRequestException(
            `These rooms [${booked_room_ids.join(', ')}] are already booked for this period. Please select different rooms or dates.`,
          );
        }

        const payment = txn.create(Payment, {
          amount: payment_amount,
          booking_id,
          status: PaymentStatus.COMPLETED,
        });
        const saved_payment = await txn.save(payment);

        await txn.update(
          Booking,
          { id: booking_id },
          { status: BookingStatus.CONFIRMED },
        );

        const { updated_at, amount, ...rest } = saved_payment;
        return { ...rest, amount: convert_to_naira(amount) };
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        error?.message || 'Failed to create payment',
      );
    }
  }
}
