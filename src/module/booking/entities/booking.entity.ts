import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingStatus } from '../enums/booking-status';
import { User } from '../../users/entities/user.entity';
import { BookedRoom } from '../../booked_rooms/entities/booked_room.entity';
import { Hotel } from '../../hotel/entities/hotel.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int', unsigned: true })
  total_price: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.DRAFT })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true })
  abandoned_reason?: string;

  @Column({ type: 'text', nullable: true })
  feedback?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToOne(() => User, (user) => user.bookings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  @OneToMany(() => BookedRoom, (bookedRoom) => bookedRoom.booking)
  booked_rooms: BookedRoom[];

  @ManyToOne(() => Hotel, (hotel) => hotel.bookings)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @Column()
  hotel_id: number;

  @OneToOne(() => Payment, (payment) => payment.booking, { nullable: true })
  payment: Payment;
}
