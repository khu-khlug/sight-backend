import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AopModule } from '@toss/nestjs-aop';

import { TransactionalDecorator } from '@sight/core/persistence/transaction/TransactionalDecorator';
import { TransactionMiddleware } from '@sight/core/persistence/transaction/TransactionMiddleware';

@Module({
  imports: [AopModule],
  providers: [TransactionalDecorator],
})
export class TransactionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('*');
  }
}
