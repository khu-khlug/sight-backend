import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Events } from 'discord.js';

import { extractDiscordEventHandlerMetadata } from '@khlug/core/discord/DiscordEventHandler';

type EventHandler = {
  instance: any;
  propertyKey: string | symbol;
};

@Injectable()
export class DiscordEventHandlerContainer {
  private readonly eventHandlerMap: Map<Events, EventHandler[]> = new Map();

  constructor(private readonly discoveryService: DiscoveryService) {}

  register() {
    this.discoveryService
      .getProviders()
      .filter((provider) => provider.instance && provider.instance.constructor)
      .forEach((provider) => {
        const metadata = extractDiscordEventHandlerMetadata(
          provider.instance.constructor,
        );

        if (!metadata) {
          return;
        }

        metadata.handlers.forEach(({ event, propertyKey }) => {
          const instance = provider.instance;
          const handlers = this.eventHandlerMap.get(event) || [];
          handlers.push({ instance, propertyKey });
          this.eventHandlerMap.set(event, handlers);
        });
      });
  }

  getEvents(): Events[] {
    return Array.from(this.eventHandlerMap.keys());
  }

  getHandlers(event: Events): EventHandler[] {
    return this.eventHandlerMap.get(event) || [];
  }
}
