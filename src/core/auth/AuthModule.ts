import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from '@khlug/core/auth/AuthGuard';
import { AuthServiceAdapter } from '@khlug/core/auth/AuthServiceAdapter';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    AuthServiceAdapter,
    // TODO: TokenVerifier 구현 후 추가
  ],
})
export class AuthModule {}
