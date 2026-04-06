import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.findByEmail(createUserDto.email);
    if (user) throw new BadRequestException('User already exists');
    const hashed_password = await bcrypt.hash(createUserDto.password, 10);
    const new_user = await this.usersService.create({
      ...createUserDto,
      password: hashed_password,
    });

    return new_user;
  }

  async login(login_dto: LoginDto) {
    const user = await this.usersService.findByEmail(login_dto.email);

    if (!user) throw new NotFoundException('User not found');

    const valid_password = await bcrypt.compare(
      login_dto.password,
      user.password,
    );

    if (!valid_password)
      throw new BadRequestException('Invalid email or password');

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    };
  }
}
