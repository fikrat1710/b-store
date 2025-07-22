import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role-enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();


    if (!user || !user.role) {
      throw new ForbiddenException('You do not have permission to access this resource. User role not found.');
    }


    const hasRequiredRole = requiredRoles.includes(user.role as Role);

    if (!hasRequiredRole) {
      throw new ForbiddenException('You do not have the necessary role to access this resource.');
    }

    return true;
  }
}