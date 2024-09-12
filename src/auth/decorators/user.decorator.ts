import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity} from '../entity/user.entity';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Partial<UserEntity> => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; 
  },
);
