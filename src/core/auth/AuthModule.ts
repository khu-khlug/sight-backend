import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthGuard } from '@sight/core/auth/AuthGuard';

@Module({
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    // TODO: TokenVerifier 구현 후 추가
  ],
})
export class AuthModule {}
