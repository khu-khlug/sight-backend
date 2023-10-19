import { EntityManager } from '@mikro-orm/core';
import { InternalServerErrorException } from '@nestjs/common';
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop';
import { ClsService } from 'nestjs-cls';

import {
  TRANSACTIONAL_DECORATOR,
  TRANSACTIONAL_ENTITY_MANAGER,
} from '@sight/core/persistence/transaction/constant';
import { TransactionalOption } from '@sight/core/persistence/transaction/TransactionalOption';

type AsyncFn<T = any> = (...args: any[]) => Promise<T>;

@Aspect(TRANSACTIONAL_DECORATOR)
export class TransactionalDecorator
  implements LazyDecorator<AsyncFn, TransactionalOption>
{
  constructor(private readonly cls: ClsService) {}

  wrap({ method }: WrapParams<AsyncFn, TransactionalOption>) {
    return async (...args: any[]) => {
      const entityManager: EntityManager | undefined = this.cls.get(
        TRANSACTIONAL_ENTITY_MANAGER,
      );
      if (!entityManager) {
        throw new InternalServerErrorException('Entity manager is not exists');
      }

      return await entityManager.transactional(async (manager) => {
        this.cls.set(TRANSACTIONAL_ENTITY_MANAGER, manager);
        return await method(...args);
      });
    };
  }
}
