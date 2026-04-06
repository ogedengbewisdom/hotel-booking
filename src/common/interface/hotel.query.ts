import type { BookingStatus } from '../../module/booking/enums/booking-status';
import type { RoomType } from '../../module/hotel_rooms/enum/hotel-type';

export interface IHotelQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface IHotelRoomQuery {
  roomType?: RoomType;
  page?: number;
  limit?: number;
  floor?: number;
}

export interface IUserQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export interface IBookingQuery {
  hotel_id?: number;
  page?: number;
  limit?: number;
  status?: BookingStatus;
  start_date?: string;
  end_date?: string;
}

export interface IDashboardQuery {
  start_date?: string;
  end_date?: string;
}
