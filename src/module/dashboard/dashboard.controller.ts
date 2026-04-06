import { Get, Param, Query, UseGuards } from '@nestjs/common';

import { Controller } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../../common/guard/role-guard/role.guard';
import { TransformParamsPipe } from '../../common/pipe/transform-params/transform-params.pipe';
import { DashboardService } from './dashboard.service';
import { UserRole } from '../users/enums/user-role';
import { Roles } from '../../common/decorator/roles.decorator';
import type { IDashboardQuery } from '../../common/interface/hotel.query';

@Controller({ path: 'dashboard', version: '1' })
@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(RoleGuard)
@Roles(UserRole.ADMIN)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: 'Get overview of the dashboard' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'The start date',
    type: Date,
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'The end date',
    type: Date,
  })
  @Get('overview')
  async getOverview(@Query() query: IDashboardQuery) {
    const data = await this.dashboardService.getOverview(query);
    return {
      message: 'Dashboard overview fetched successfully',
      data,
    };
  }

  @ApiOperation({ summary: 'Get overview of the hotel' })
  @ApiParam({ name: 'id', description: 'The hotel ID', type: Number })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'The start date',
    type: Date,
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'The end date',
    type: Date,
  })
  @Get('hotel/:id')
  async getHotelOverview(
    @Param('id', TransformParamsPipe) id: number,
    @Query() query: IDashboardQuery,
  ) {
    const data = await this.dashboardService.getHotelOverview(id, query);
    return {
      message: 'Hotel overview fetched successfully',
      data,
    };
  }
}
