import { Events } from 'discord.js';

const DiscordEventHandlerMetadataKey = Symbol('DiscordEventHandlerMetadata');

export type DiscordEventHandlerMetadata = {
  handlers: {
    event: Events;
    propertyKey: string | symbol;
  }[];
};

export const DiscordEventHandler =
  (event: Events): MethodDecorator =>
  (target, propertyKey) => {
    const ctor = target.constructor;
    let metadata: DiscordEventHandlerMetadata = Reflect.getMetadata(
      DiscordEventHandlerMetadataKey,
      ctor,
    );

    if (!metadata) {
      metadata = { handlers: [] };
    }

    metadata.handlers.push({
      event,
      propertyKey,
    });

    Reflect.defineMetadata(DiscordEventHandlerMetadataKey, metadata, ctor);
  };

export const extractDiscordEventHandlerMetadata = (
  ctor: any,
): DiscordEventHandlerMetadata | undefined => {
  return Reflect.getMetadata(DiscordEventHandlerMetadataKey, ctor) ?? undefined;
};
