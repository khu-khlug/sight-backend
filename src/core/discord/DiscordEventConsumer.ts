import { ConsoleLogger, Injectable, OnModuleInit } from '@nestjs/common';

import { DiscordClient } from '@khlug/core/discord/DiscordClient';
import { DiscordEventHandlerContainer } from '@khlug/core/discord/DiscordEventHandlerContainer';

@Injectable()
export class DiscordEventConsumer implements OnModuleInit {
  private readonly logger = new ConsoleLogger(DiscordEventConsumer.name);

  constructor(
    private readonly discordClient: DiscordClient,
    private readonly discordEventHandlerContainer: DiscordEventHandlerContainer,
  ) {}

  async onModuleInit() {
    this.discordEventHandlerContainer.register();

    const events = this.discordEventHandlerContainer.getEvents();
    events.forEach((event) => {
      this.discordClient.on(event, (...args) => {
        this.logger.log(`Handling discord event ${event}`);

        const handlers = this.discordEventHandlerContainer.getHandlers(event);
        Promise.all(
          handlers.map(({ instance, propertyKey }) =>
            instance[propertyKey](...args),
          ),
        )
          .then(() => {
            this.logger.log(`Discord event ${event} handled`);
          })
          .catch((error: Error) => {
            this.logger.error(
              `Error occurred while handling event ${event}`,
              error.stack,
            );
          });
      });
    });

    await this.discordClient.login();
  }
}
