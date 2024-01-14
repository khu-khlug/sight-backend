import { Request } from 'express';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ITokenVerifier, TokenVerifier } from '@sight/core/auth/ITokenVerifier';

import { Message } from '@sight/constant/message';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(TokenVerifier)
    private readonly tokenVerifier: ITokenVerifier,
    private readonly clsService: ClsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();
    const authorizationHeader = req.headers['authorization'];

    if (!authorizationHeader) {
      throw new UnauthorizedException(Message.TOKEN_REQUIRED);
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException(Message.TOKEN_REQUIRED);
    }

    const requester = this.tokenVerifier.verify(token);
    req['requester'] = requester;

    this.clsService.set('requester', requester);

    return true;
  }
}
