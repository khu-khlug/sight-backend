import { ICommandHandler, IEventHandler } from '@nestjs/cqrs';

import { TRANSACTIONAL_DECORATOR } from '@khlug/core/persistence/transaction/constant';

import { IsAsyncFunction } from '@khlug/util/types';

export type KeyOf<T extends ICommandHandler | IEventHandler> =
  T extends ICommandHandler
    ? 'execute'
    : T extends IEventHandler
    ? 'handle'
    : never;

export const Transactional =
  () =>
  <T extends ICommandHandler | IEventHandler, K extends keyof T>(
    target: T,
    propertyKey: IsAsyncFunction<T[K]> extends true ? KeyOf<T> : never,
  ) => {
    Reflect.defineMetadata(
      TRANSACTIONAL_DECORATOR,
      true,
      target,
      propertyKey as string,
    );
  };
