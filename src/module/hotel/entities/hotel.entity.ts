import { Booking } from '../../booking/entities/booking.entity';
import { HotelRoom } from '../../hotel_rooms/entities/hotel_room.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('hotel')
export class Hotel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @Column()
  total_rooms: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.hotel)
  @JoinColumn({ name: 'admin_id' })
  created_by: User;

  @Column()
  admin_id: number;

  @OneToMany(() => HotelRoom, (hotelRoom) => hotelRoom.hotel)
  rooms: HotelRoom[];

  @OneToMany(() => Booking, (booking) => booking.hotel)
  bookings: Booking[];
}
