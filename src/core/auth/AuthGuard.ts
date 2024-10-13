import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';

import { AUTH_DECORATOR_METADATA_KEY } from '@khlug/core/auth/Auth';
import { IRequester } from '@khlug/core/auth/IRequester';
import { LaravelAuthnAdapter } from '@khlug/core/auth/LaravelAuthnAdapter';
import { UserRole } from '@khlug/core/auth/UserRole';

import { User } from '@khlug/app/domain/user/model/User';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly laravelAuthnAdapter: LaravelAuthnAdapter,
    private readonly clsService: ClsService,

    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();

    const authMetadata = Reflect.getMetadata(
      AUTH_DECORATOR_METADATA_KEY,
      context.getHandler(),
    );
    if (!authMetadata) {
      return true;
    }

    const rawSession = req.cookies['khlug_session'];

    if (!rawSession) {
      throw new UnauthorizedException();
    }

    const requesterUserId =
      await this.laravelAuthnAdapter.authenticate(rawSession);
    if (!requesterUserId) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({ id: requesterUserId });
    if (!user) {
      throw new UnauthorizedException();
    }

    const requester: IRequester = {
      userId: requesterUserId,
      role: user.manager ? UserRole.MANAGER : UserRole.USER,
    };

    const { roles } = authMetadata;
    if (!roles.includes(requester.role)) {
      throw new UnauthorizedException();
    }

    req['requester'] = requester;
    this.clsService.set('requester', requester);

    return true;
  }
}
