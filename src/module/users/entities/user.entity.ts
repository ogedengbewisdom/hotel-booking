import { cp } from 'fs';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums/user-role';
import { Hotel } from '../../hotel/entities/hotel.entity';
import { Booking } from '../../booking/entities/booking.entity';
import { UserStatus } from '../enums/user.status';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column()
  password: string;

  @Column()
  phone_number: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @DeleteDateColumn()
  deleted_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Hotel, (hotel) => hotel.created_by)
  hotel: Hotel[];

  @OneToMany(() => Booking, (booking) => booking.user)
  bookings: Booking[];
}
