import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  Put,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRole } from '../users/enums/user-role';
import { RoleGuard } from '../../common/guard/role-guard/role.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  IHotelQuery,
  IHotelRoomQuery,
} from '../../common/interface/hotel.query';
import { Public } from '../../common/decorator/public.decorator';
import { TransformParamsPipe } from '../../common/pipe/transform-params/transform-params.pipe';
import { RoomType } from '../hotel_rooms/enum/hotel-type';

@Controller({ path: 'hotel', version: '1' })
@ApiTags('Hotel')
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiBody({ type: CreateHotelDto, description: 'The hotel data' })
  @ApiResponse({ status: 201, description: 'Created' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createHotelDto: CreateHotelDto, @Request() req) {
    const user_id = Number(req.user?.sub);
    const hotel = await this.hotelService.create(createHotelDto, user_id);

    return { message: 'Hotel created successfully', data: hotel.id };
  }

  @Public()
  @ApiOperation({ summary: 'Get all hotels with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  async findAll(@Query() query: IHotelQuery) {
    const hotels = await this.hotelService.findAll(query);
    return {
      message: 'Hotels fetched successfully',
      // data: hotels.data,
      data: {
        hotels: hotels.data,
        page: hotels.page,
        limit: hotels.limit,
        total: hotels.total,
        totalPages: hotels.total_pages,
      },
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get a hotel by id' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'room_type', required: false, enum: RoomType })
  @ApiQuery({ name: 'floor', required: false, type: Number, example: 1 })
  @ApiParam({ name: 'id', description: 'The hotel ID', type: Number })
  @Get(':id')
  async findOne(
    @Param('id', TransformParamsPipe) id: number,
    @Query() query: IHotelRoomQuery,
  ) {
    const hotel = await this.hotelService.find_hotel_rooms(id, query);
    return {
      message: 'Hotel fetched successfully',
      data: hotel,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a hotel by id' })
  @ApiBody({ type: UpdateHotelDto, description: 'The updated hotel data' })
  @ApiParam({ name: 'id', description: 'The hotel ID', type: Number })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id', TransformParamsPipe) id: number,
    @Body() updateHotelDto: UpdateHotelDto,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const updated_hotel = await this.hotelService.update_hotel(
      id,
      updateHotelDto,
      user_id,
    );
    return {
      message: 'Hotel updated successfully',
      data: updated_hotel?.id,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change the status of a hotel by id' })
  @ApiParam({ name: 'id', description: 'The hotel ID', type: Number })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async changeStatus(
    @Param('id', TransformParamsPipe) id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const hotel = await this.hotelService.change_hotel_status(id, user_id);
    return {
      message: 'Hotel status changed successfully',
      data: { is_active: hotel?.is_active },
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a hotel by id' })
  @ApiParam({ name: 'id', description: 'The hotel ID', type: Number })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id', TransformParamsPipe) id: number, @Request() req) {
    const user_id = Number(req.user?.sub);
    const deleted_hotel = await this.hotelService.remove_hotel(id, user_id);
    return {
      message: 'Hotel deleted successfully',
      data: deleted_hotel,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a hotel by id' })
  @ApiParam({ name: 'id', description: 'The hotel ID', type: Number })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  async restore(@Param('id', TransformParamsPipe) id: number) {
    const restored_hotel = await this.hotelService.restore_hotel(id);
    return {
      message: 'Hotel restored successfully',
      data: restored_hotel,
    };
  }
}
