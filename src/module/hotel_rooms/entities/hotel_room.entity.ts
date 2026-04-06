import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { RoomType } from '../enum/hotel-type';
import { Hotel } from '../../hotel/entities/hotel.entity';
import { BookedRoom } from '../../booked_rooms/entities/booked_room.entity';

@Entity('hotel_rooms')
@Unique(['room_number', 'hotel_id'])
export class HotelRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  room_number: number;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ type: 'enum', enum: RoomType, default: RoomType.SINGLE })
  room_type: RoomType;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', unsigned: true })
  price_per_night: number;

  @Column({ type: 'jsonb', default: [] })
  images: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @Column()
  hotel_id: number;

  @OneToMany(() => BookedRoom, (bookedRoom) => bookedRoom.hotel_room)
  booked_rooms: BookedRoom[];
}
