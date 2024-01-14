import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { ICommandHandler, IEventHandler } from '@nestjs/cqrs';
import { ClsService } from 'nestjs-cls';

import { TRANSACTIONAL_ENTITY_MANAGER } from '@sight/core/persistence/transaction/constant';
import { TransactionMethodExplorer } from '@sight/core/persistence/transaction/TransactionMethodExplorer';

type AsyncFn = (...args: any[]) => Promise<any>;

@Injectable()
export class TransactionalApplier {
  constructor(
    private readonly cls: ClsService,
    private readonly em: EntityManager,
    private readonly explorer: TransactionMethodExplorer,
  ) {}

  bindTransactional() {
    this.explorer
      .listTransactionalCommandHandler()
      .forEach((handler: ICommandHandler) => {
        handler.execute = this.createWrappedFunction(handler.execute, true);
      });
    this.explorer
      .listNotTransactionalEventHandler()
      .forEach((handler: IEventHandler) => {
        handler.handle = this.createWrappedFunction(handler.handle, false);
      });
    this.explorer
      .listTransactionalEventHandler()
      .forEach((handler: IEventHandler) => {
        handler.handle = this.createWrappedFunction(handler.handle, true);
      });
  }

  private createWrappedFunction(originalFn: AsyncFn, transaction: boolean) {
    const wrapper = async (...args: any[]) => {
      if (transaction) {
        return await this.em.transactional(async (manager) => {
          this.cls.set(TRANSACTIONAL_ENTITY_MANAGER, manager);
          return await originalFn(args);
        });
      } else {
        this.cls.set(TRANSACTIONAL_ENTITY_MANAGER, this.em);
        return await originalFn(args);
      }
    };
    Object.setPrototypeOf(wrapper, originalFn);
    return wrapper;
  }
}
