import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from '@khlug/core/auth/AuthGuard';
import { LaravelAuthnAdapter } from '@khlug/core/auth/LaravelAuthnAdapter';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    LaravelAuthnAdapter,
    // TODO: TokenVerifier 구현 후 추가
  ],
})
export class AuthModule {}
