import { Module, OnModuleInit } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { TransactionalApplier } from '@sight/core/persistence/transaction/TransactionalApplier';

@Module({
  imports: [DiscoveryModule],
  providers: [TransactionalApplier],
})
export class TransactionModule implements OnModuleInit {
  constructor(private readonly transactionalApplier: TransactionalApplier) {}

  onModuleInit() {
    this.transactionalApplier.bindTransactional();
  }
}
