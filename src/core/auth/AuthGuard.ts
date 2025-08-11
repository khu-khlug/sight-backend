import { EntityManager } from '@mikro-orm/mysql';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClsService } from 'nestjs-cls';

import { AUTH_DECORATOR_METADATA_KEY } from '@khlug/core/auth/Auth';
import { AuthServiceAdapter } from '@khlug/core/auth/AuthServiceAdapter';
import { IRequester } from '@khlug/core/auth/IRequester';
import { UserRole } from '@khlug/core/auth/UserRole';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly laravelAuthnAdapter: AuthServiceAdapter,
    private readonly clsService: ClsService,
    private readonly em: EntityManager,
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

    const cookies = req.headers['cookie'];

    if (!cookies) {
      throw new UnauthorizedException();
    }

    const requesterUserId =
      await this.laravelAuthnAdapter.authenticate(cookies);
    if (!requesterUserId) {
      throw new UnauthorizedException();
    }

    // TODO: User 엔티티 정의 후 수정 필요
    const result: { manager: boolean }[] = await this.em
      .getConnection()
      .execute('SELECT * FROM khlug_members WHERE id = ?', [requesterUserId]);
    if (!result || result.length === 0) {
      throw new UnauthorizedException();
    }

    const user = result[0];
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
