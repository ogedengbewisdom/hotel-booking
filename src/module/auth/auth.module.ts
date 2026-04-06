import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'my_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    UsersModule,
  ],
  exports: [JwtModule],
})
export class AuthModule {}
