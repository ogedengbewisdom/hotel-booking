import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorator/public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller({ path: 'auth', version: '1' })
@ApiTags('Authorization')
@ApiResponse({ status: 400, description: 'Bad Request' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden' })
@ApiResponse({ status: 404, description: 'Not Found' })
@ApiResponse({ status: 500, description: 'Internal Server Error' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiBody({ type: CreateUserDto, description: 'The user data' })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  @Post('signup')
  async signup(@Body() register_dto: CreateUserDto) {
    const register = await this.authService.register(register_dto);
    return { message: 'user signed up successfully ', data: register.id };
  }

  @Public()
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ type: LoginDto, description: 'The login data' })
  @ApiResponse({ status: 200, description: 'Logged in successfully' })
  @Post('login')
  async login(@Body() login_dto: LoginDto) {
    const login = await this.authService.login(login_dto);
    return { message: 'user logged in successfully ', data: login };
  }
}
