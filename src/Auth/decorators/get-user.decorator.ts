import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/User/schemas/user.schema';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);