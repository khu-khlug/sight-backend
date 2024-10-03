import { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Message } from '@sight/constant/message';
import { LaravelAuthnAdapter } from './LaravelAuthnAdapter';
import { IRequester } from './IRequester';
import { InjectRepository } from '@mikro-orm/nestjs';
import { User } from '@sight/app/domain/user/model/User';
import { EntityRepository } from '@mikro-orm/core';
import { UserRole } from './UserRole';

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
    const rawSession = req.cookies['khlug_session'];

    if (!rawSession) {
      throw new UnauthorizedException(Message.TOKEN_REQUIRED);
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

    req['requester'] = requester;
    this.clsService.set('requester', requester);

    return true;
  }
}
