import { ExecutionContext, Injectable, UnauthorizedException, Logger, ForbiddenException, CanActivate } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express'; 

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);


  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.log('--- JwtAuthGuard: handleRequest called ---');
    if (err || !user) {
      this.logger.error(`--- JwtAuthGuard: Authentication failed --- Error: ${err?.message || 'N/A'}, Info: ${info?.message || 'N/A'}`);
      throw err || new UnauthorizedException('JwtAuthGuard: Autentifikatsiya muvaffaqiyatsiz.');
    }

    this.logger.log(`--- JwtAuthGuard: User authenticated. User object in guard: ${JSON.stringify(user)}`);
    return user; 
  }

  canActivate(context: ExecutionContext) {
    this.logger.log('--- JwtAuthGuard: canActivate called ---');
    return super.canActivate(context);
  }
}

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt') {
  private readonly logger = new Logger(RefreshJwtAuthGuard.name);

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    this.logger.log('--- RefreshJwtAuthGuard: handleRequest called ---');
    if (err || !user) {
      this.logger.error(`--- RefreshJwtAuthGuard: Authentication failed --- Error: ${err?.message || 'N/A'}, Info: ${info?.message || 'N/A'}`);
      throw err || new UnauthorizedException('RefreshJwtAuthGuard: Autentifikatsiya muvaffaqiyatsiz.');
    }
    this.logger.log(`--- RefreshJwtAuthGuard: User authenticated. User object in guard: ${JSON.stringify(user)}`);
    return user;
  }

  canActivate(context: ExecutionContext) {
    this.logger.log('--- RefreshJwtAuthGuard: canActivate called ---');
    return super.canActivate(context);
  }
}


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

    if (!user || !user.roles) {
      throw new ForbiddenException('You do not have permission to access this resource. User roles not found.');
    }

    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException('You do not have the necessary role to access this resource.');
    }

    return true;
  }
}