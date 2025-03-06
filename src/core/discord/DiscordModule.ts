import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { DiscordClient } from '@khlug/core/discord/DiscordClient';
import { DiscordEventConsumer } from '@khlug/core/discord/DiscordEventConsumer';
import { DiscordEventHandlerContainer } from '@khlug/core/discord/DiscordEventHandlerContainer';

@Module({
  imports: [DiscoveryModule],
  providers: [
    DiscordClient,
    DiscordEventHandlerContainer,
    DiscordEventConsumer,
  ],
})
export class DiscordModule {}
