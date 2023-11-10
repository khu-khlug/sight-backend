import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { TransactionalApplier } from '@sight/core/persistence/transaction/TransactionalApplier';
import { TransactionMiddleware } from '@sight/core/persistence/transaction/TransactionMiddleware';

@Module({
  imports: [DiscoveryModule],
  providers: [TransactionalApplier],
})
export class TransactionModule implements NestModule, OnModuleInit {
  constructor(private readonly transactionalApplier: TransactionalApplier) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('*');
  }

  onModuleInit() {
    this.transactionalApplier.bindTransactional();
  }
}
