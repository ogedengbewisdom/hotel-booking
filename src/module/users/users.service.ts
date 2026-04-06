import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { IUserQuery } from '../../common/interface/hotel.query';
import { UserRole } from './enums/user-role';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to create user',
      );
    }
  }

  async findAll(query: IUserQuery) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const where: FindOptionsWhere<User>[] = search
      ? [
          {
            first_name: ILike(`%${search}%`),
            last_name: ILike(`%${search}%`),
            email: ILike(`%${search}%`),
          },
        ]
      : [];

    try {
      const [data, total] = await this.userRepository.findAndCount({
        where,
        skip,
        take: limit,
        order: {
          created_at: 'DESC',
        },
      });
      // return users;
      const mapped_data = data.map((user) => {
        const { created_at, updated_at, deleted_at, password, ...rest } = user;
        return rest;
      });
      return {
        data: mapped_data,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to find all users',
      );
    }
  }

  async findByEmail(email: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to find user by email',
      );
    }
  }

  async find_one(user_id: number, token_id: number, token_role: UserRole) {
    const user = await this.findById(user_id);
    if (!user) throw new NotFoundException('User not found');
    const is_authorized = user.id === token_id || token_role === UserRole.ADMIN;

    if (!is_authorized)
      throw new ForbiddenException(
        'You are not authorized to access this user',
      );

    const { created_at, updated_at, deleted_at, password, ...rest } = user;

    return rest;
  }

  async findById(id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      return user;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to find user by id',
      );
    }
  }

  async update(
    user_id: number,
    updateUserDto: UpdateUserDto,
    token_id: number,
    token_role: UserRole,
  ) {
    const user = await this.findById(user_id);
    if (!user) throw new NotFoundException('User not found');

    const is_authorized = user.id === token_id || token_role === UserRole.ADMIN;

    if (!is_authorized)
      throw new ForbiddenException(
        'You are not authorized to update this user',
      );

    try {
      await this.userRepository.update(user_id, {
        ...updateUserDto,
      });
      return await this.findById(user_id);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to update user',
      );
    }
  }
  async remove(user_id: number, token_id: number, token_role: UserRole) {
    const user = await this.findById(user_id);
    if (!user) throw new NotFoundException('User not found');

    if (user.deleted_at) throw new BadRequestException('User already deleted');

    const is_authorized = user.id === token_id || token_role === UserRole.ADMIN;

    if (!is_authorized)
      throw new ForbiddenException(
        'You are not authorized to delete this user',
      );

    try {
      await this.userRepository.softDelete(user_id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to remove user',
      );
    }
  }

  async restore(user_id: number) {
    const user = await this.userRepository.findOne({
      where: { id: user_id },
      withDeleted: true,
    });
    if (!user) throw new NotFoundException('User not found');

    if (!user.deleted_at) throw new BadRequestException('User is not deleted');

    try {
      await this.userRepository.restore(user_id);
      return true;
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message || 'Failed to restore user',
      );
    }
  }
}
