import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { TransformParamsPipe } from '../../common/pipe/transform-params/transform-params.pipe';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleGuard } from '../../common/guard/role-guard/role.guard';
import { Roles } from '../../common/decorator/roles.decorator';
import { UserRole } from './enums/user-role';
import type { IUserQuery } from '../../common/interface/hotel.query';
import { User } from './entities/user.entity';

@Controller({ path: 'users', version: '1' })
@ApiResponse({ status: 200, description: 'Success' })
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users by admin with pagination and search',
  })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'John' })
  @ApiResponse({
    status: 200,
    description: 'Users fetched successfully',
    type: User,
  })
  @Get()
  async findAll(@Query() query: IUserQuery) {
    const users = await this.usersService.findAll(query);
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a user by id by admin or self' })
  @Get(':user_id')
  async findOne(
    @Param('user_id', TransformParamsPipe) user_id: number,
    @Request() req,
  ) {
    const token_id = Number(req.user?.sub);
    const token_role = req.user?.role as UserRole;
    const user = await this.usersService.find_one(
      user_id,
      token_id,
      token_role,
    );
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a user by id by admin or self' })
  @ApiBody({ type: UpdateUserDto, description: 'The updated user data' })
  @Put(':user_id')
  async update(
    @Param('user_id', TransformParamsPipe) user_id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    const token_id = Number(req.user?.sub);
    const token_role = req.user?.role as UserRole;
    const user = await this.usersService.update(
      user_id,
      updateUserDto,
      token_id,
      token_role,
    );
    return {
      message: 'User updated successfully',
      data: user?.id,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by id by admin or self' })
  @Delete(':user_id')
  async remove(
    @Param('user_id', TransformParamsPipe) user_id: number,
    @Request() req,
  ) {
    const token_id = Number(req.user?.sub);
    const token_role = req.user?.role as UserRole;
    const user = await this.usersService.remove(user_id, token_id, token_role);
    return {
      message: 'User deleted successfully',
      data: user,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restore a user by id by admin' })
  @UseGuards(RoleGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':user_id/restore')
  async restore(@Param('user_id', TransformParamsPipe) user_id: number) {
    const user = await this.usersService.restore(user_id);
    return {
      message: 'User restored successfully',
      data: user,
    };
  }
}
