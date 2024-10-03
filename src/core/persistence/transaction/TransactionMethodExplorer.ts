import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { ICommandHandler, IEventHandler } from '@nestjs/cqrs';

import {
  COMMAND_HANDLER_METADATA,
  EVENTS_HANDLER_METADATA,
  TRANSACTIONAL_DECORATOR,
} from '@khlug/core/persistence/transaction/constant';

@Injectable()
export class TransactionMethodExplorer {
  constructor(private readonly discoveryService: DiscoveryService) {}

  listTransactionalCommandHandler(): ICommandHandler[] {
    return this.discoveryService
      .getProviders()
      .filter((wrapper) => {
        console.log([wrapper.token, !!wrapper.instance]);
        return Reflect.getMetadata(COMMAND_HANDLER_METADATA, wrapper.instance);
      })
      .map((wrapper) => wrapper.instance)
      .filter((instance: ICommandHandler) =>
        Reflect.getMetadata(TRANSACTIONAL_DECORATOR, instance, 'execute'),
      );
  }

  listTransactionalEventHandler(): IEventHandler[] {
    return this.discoveryService
      .getProviders({ metadataKey: EVENTS_HANDLER_METADATA })
      .map((wrapper) => wrapper.instance)
      .filter((instance: IEventHandler) =>
        Reflect.getMetadata(TRANSACTIONAL_DECORATOR, instance, 'handle'),
      );
  }

  listNotTransactionalEventHandler(): IEventHandler[] {
    return this.discoveryService
      .getProviders({ metadataKey: EVENTS_HANDLER_METADATA })
      .map((wrapper) => wrapper.instance)
      .filter(
        (instance: IEventHandler) =>
          !Reflect.getMetadata(TRANSACTIONAL_DECORATOR, instance, 'handle'),
      );
  }
}
