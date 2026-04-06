import { Booking } from '../../booking/entities/booking.entity';
import { HotelRoom } from '../../hotel_rooms/entities/hotel_room.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('booked_rooms')
export class BookedRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  booking_id: number;

  @ManyToOne(() => Booking, (booking) => booking.booked_rooms)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column()
  room_id: number;

  @ManyToOne(() => HotelRoom, (hotelRoom) => hotelRoom.booked_rooms)
  @JoinColumn({ name: 'room_id' })
  hotel_room: HotelRoom;
}
