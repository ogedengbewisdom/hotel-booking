import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { HotelRoomsService } from './hotel_rooms.service';
import { CreateHotelRoomDto } from './dto/create-hotel_room.dto';
import { UpdateHotelRoomDto } from './dto/update-hotel_room.dto';
import { TransformParamsPipe } from '../../common/pipe/transform-params/transform-params.pipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../../common/guard/role-guard/role.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRole } from '../users/enums/user-role';
import type { IHotelRoomQuery } from '../../common/interface/hotel.query';
import { Public } from '../../common/decorator/public.decorator';
import { RoomType } from './enum/hotel-type';

@Controller({ path: 'hotel/:hotel_id/rooms', version: '1' })
@ApiTags('Hotel Rooms')
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
export class HotelRoomsController {
  constructor(private readonly hotelRoomsService: HotelRoomsService) {}

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new hotel room' })
  @ApiBody({ type: CreateHotelRoomDto, description: 'The hotel room data' })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @ApiResponse({ status: 201, description: 'Created' })
  @Post()
  async create(
    @Body() createHotelRoomDto: CreateHotelRoomDto,
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const room = await this.hotelRoomsService.create_hotel_room(
      createHotelRoomDto,
      hotel_id,
      user_id,
    );
    return {
      message: 'Hotel room created successfully',
      data: room.id,
    };
  }

  @Public()
  @ApiOperation({
    summary: 'Get all hotel rooms by hotel id with pagination and search',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'room_type', required: false, enum: RoomType })
  @ApiQuery({ name: 'floor', required: false, type: Number, example: 1 })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @Get()
  async findAll(
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Query() query: IHotelRoomQuery,
  ) {
    const rooms = await this.hotelRoomsService.find_hotel_rooms(
      hotel_id,
      query,
    );
    return {
      message: 'Hotel rooms fetched successfully',
      data: rooms,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get a hotel room by id' })
  @ApiParam({ name: 'room_id', description: 'The hotel room ID', type: Number })
  @Get(':room_id')
  async findOne(@Param('room_id', TransformParamsPipe) room_id: number) {
    const room = await this.hotelRoomsService.find_hotel_room_by_id(room_id);
    return {
      message: 'Hotel room fetched successfully',
      data: room,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a hotel room by id' })
  @ApiBody({
    type: UpdateHotelRoomDto,
    description: 'The updated hotel room data',
  })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @ApiParam({ name: 'room_id', description: 'The hotel room ID', type: Number })
  @Put(':room_id')
  async update(
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Param('room_id', TransformParamsPipe) room_id: number,
    @Body() updateHotelRoomDto: UpdateHotelRoomDto,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const room = await this.hotelRoomsService.update_hotel_room(
      hotel_id,
      room_id,
      updateHotelRoomDto,
      user_id,
    );
    return {
      message: 'Hotel room updated successfully',
      data: room,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Change a hotel room status by id' })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @ApiParam({ name: 'room_id', description: 'The hotel room ID', type: Number })
  @Patch(':room_id/status')
  async changeStatus(
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Param('room_id', TransformParamsPipe) room_id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const hotel_room = await this.hotelRoomsService.change_hotel_room_status(
      hotel_id,
      room_id,
      user_id,
    );
    return {
      message: 'Hotel room status changed successfully',
      data: hotel_room,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete a hotel room by id' })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @ApiParam({ name: 'room_id', description: 'The hotel room ID', type: Number })
  @Delete(':room_id')
  async remove(
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Param('room_id', TransformParamsPipe) room_id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const deleted_room = await this.hotelRoomsService.remove_hotel_room(
      hotel_id,
      room_id,
      user_id,
    );
    return {
      message: 'Hotel room deleted successfully',
      data: deleted_room,
    };
  }

  @ApiBearerAuth()
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a hotel room by id' })
  @ApiParam({ name: 'hotel_id', description: 'The hotel ID', type: Number })
  @ApiParam({ name: 'room_id', description: 'The hotel room ID', type: Number })
  @ApiResponse({ status: 200, description: 'Hotel room restored successfully' })
  @Patch(':room_id/restore')
  async restore(
    @Param('hotel_id', TransformParamsPipe) hotel_id: number,
    @Param('room_id', TransformParamsPipe) room_id: number,
    @Request() req,
  ) {
    const user_id = Number(req.user?.sub);
    const restored_room = await this.hotelRoomsService.restore_hotel_room(
      hotel_id,
      room_id,
      user_id,
    );
    return {
      message: 'Hotel room restored successfully',
      data: restored_room,
    };
  }
}
