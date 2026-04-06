import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/common/decorator/roles.decorator';
import { UserRole } from 'src/common/interface/jwt.payload';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const required_roles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required_roles) return true;

    const ctx = context.switchToHttp();

    const req = ctx.getRequest<Request>();

    const user = req.user;

    if (!user) throw new UnauthorizedException('User not found');

    const user_role = user.role as UserRole;

    const has_role = required_roles.includes(user_role);

    if (!has_role) throw new ForbiddenException('Access denied');

    return true;
  }
}
