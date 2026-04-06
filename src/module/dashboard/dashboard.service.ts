import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDashboardQuery } from '../../common/interface/hotel.query';
import { Between, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Booking } from '../booking/entities/booking.entity';
import { BookingStatus } from '../booking/enums/booking-status';
import { convert_to_naira } from '../../util/lib';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly user_repository: Repository<User>,
    @InjectRepository(Booking)
    private readonly booking_repository: Repository<Booking>,
  ) {}

  private calculate_percentage_change(current: number, previous: number) {
    if (previous === 0) return current === 0 ? 0 : 100;
    return Number(((current - previous) / previous) * 100).toFixed(2);
  }

  private get_periods(start_date?: string, end_date?: string) {
    const end = end_date ? new Date(end_date) : new Date();
    const start = start_date
      ? new Date(start_date)
      : new Date(end.getFullYear(), end.getMonth(), 1);

    end.setHours(23, 59, 59, 999);

    const period_length = end.getTime() - start.getTime();
    const prev_start = new Date(start.getTime() - period_length);
    const prev_end = new Date(start);

    return { start, end, prev_start, prev_end };
  }

  private async get_booking_counts(
    where_base: object,
    start: Date,
    end: Date,
    prev_start: Date,
    prev_end: Date,
    status: BookingStatus,
  ) {
    const [current, previous, total] = await Promise.all([
      this.booking_repository.count({
        where: { ...where_base, status, created_at: Between(start, end) },
      }),
      this.booking_repository.count({
        where: {
          ...where_base,
          status,
          created_at: Between(prev_start, prev_end),
        },
      }),
      this.booking_repository.count({ where: { ...where_base, status } }),
    ]);
    return { current, previous, total };
  }

  private async get_revenue(
    where_base: object,
    start: Date,
    end: Date,
    prev_start: Date,
    prev_end: Date,
  ) {
    const base_query = () =>
      this.booking_repository
        .createQueryBuilder('b')
        .select('SUM(b.total_price)', 'total')
        .where('b.status = :status', { status: BookingStatus.CONFIRMED });

    const apply_where = (query: any) => {
      if ((where_base as any).hotel_id) {
        query.andWhere('b.hotel_id = :hotel_id', {
          hotel_id: (where_base as any).hotel_id,
        });
      }
      return query;
    };

    const [current_result, prev_result, total_result] = await Promise.all([
      apply_where(base_query())
        .andWhere('b.created_at BETWEEN :start AND :end', { start, end })
        .getRawOne(),
      apply_where(base_query())
        .andWhere('b.created_at BETWEEN :start AND :end', {
          start: prev_start,
          end: prev_end,
        })
        .getRawOne(),
      apply_where(base_query()).getRawOne(),
    ]);

    return {
      current: Number(current_result?.total || 0),
      previous: Number(prev_result?.total || 0),
      total: Number(total_result?.total || 0),
    };
  }

  async getOverview(query: IDashboardQuery) {
    const { start_date, end_date } = query;
    const { start, end, prev_start, prev_end } = this.get_periods(
      start_date,
      end_date,
    );

    // Users
    const [current_users, prev_users, total_users] = await Promise.all([
      this.user_repository.count({
        where: { created_at: Between(start, end) },
      }),
      this.user_repository.count({
        where: { created_at: Between(prev_start, prev_end) },
      }),
      this.user_repository.count(),
    ]);

    // Bookings by status
    const [confirmed, draft, cancelled, abandoned] = await Promise.all([
      this.get_booking_counts(
        {},
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.CONFIRMED,
      ),
      this.get_booking_counts(
        {},
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.DRAFT,
      ),
      this.get_booking_counts(
        {},
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.CANCELLED,
      ),
      this.get_booking_counts(
        {},
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.ABANDONED,
      ),
    ]);

    // Revenue
    const revenue = await this.get_revenue(
      {},
      start,
      end,
      prev_start,
      prev_end,
    );

    return {
      users: {
        total: total_users,
        period_count: current_users,
        percentage_change: this.calculate_percentage_change(
          current_users,
          prev_users,
        ),
      },
      bookings: {
        confirmed: {
          total: confirmed.total,
          period_count: confirmed.current,
          percentage_change: this.calculate_percentage_change(
            confirmed.current,
            confirmed.previous,
          ),
        },
        draft: {
          total: draft.total,
          period_count: draft.current,
          percentage_change: this.calculate_percentage_change(
            draft.current,
            draft.previous,
          ),
        },
        cancelled: {
          total: cancelled.total,
          period_count: cancelled.current,
          percentage_change: this.calculate_percentage_change(
            cancelled.current,
            cancelled.previous,
          ),
        },
        abandoned: {
          total: abandoned.total,
          period_count: abandoned.current,
          percentage_change: this.calculate_percentage_change(
            abandoned.current,
            abandoned.previous,
          ),
        },
      },
      revenue: {
        total: convert_to_naira(revenue.total),
        period_revenue: convert_to_naira(revenue.current),
        percentage_change: this.calculate_percentage_change(
          revenue.current,
          revenue.previous,
        ),
      },
      period: { start, end },
    };
  }

  async getHotelOverview(hotel_id: number, query: IDashboardQuery) {
    const { start_date, end_date } = query;
    const { start, end, prev_start, prev_end } = this.get_periods(
      start_date,
      end_date,
    );

    const where_base = { hotel_id };

    // Bookings by status
    const [confirmed, draft, cancelled, abandoned] = await Promise.all([
      this.get_booking_counts(
        where_base,
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.CONFIRMED,
      ),
      this.get_booking_counts(
        where_base,
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.DRAFT,
      ),
      this.get_booking_counts(
        where_base,
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.CANCELLED,
      ),
      this.get_booking_counts(
        where_base,
        start,
        end,
        prev_start,
        prev_end,
        BookingStatus.ABANDONED,
      ),
    ]);

    // Revenue
    const revenue = await this.get_revenue(
      where_base,
      start,
      end,
      prev_start,
      prev_end,
    );

    return {
      bookings: {
        confirmed: {
          total: confirmed.total,
          period_count: confirmed.current,
          percentage_change: this.calculate_percentage_change(
            confirmed.current,
            confirmed.previous,
          ),
        },
        draft: {
          total: draft.total,
          period_count: draft.current,
          percentage_change: this.calculate_percentage_change(
            draft.current,
            draft.previous,
          ),
        },
        cancelled: {
          total: cancelled.total,
          period_count: cancelled.current,
          percentage_change: this.calculate_percentage_change(
            cancelled.current,
            cancelled.previous,
          ),
        },
        abandoned: {
          total: abandoned.total,
          period_count: abandoned.current,
          percentage_change: this.calculate_percentage_change(
            abandoned.current,
            abandoned.previous,
          ),
        },
      },
      revenue: {
        total: convert_to_naira(revenue.total),
        period_revenue: convert_to_naira(revenue.current),
        percentage_change: this.calculate_percentage_change(
          revenue.current,
          revenue.previous,
        ),
      },
      period: { start, end },
    };
  }
}
