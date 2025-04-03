import { ConsoleLogger, Inject, Injectable } from '@nestjs/common';
import { Routes } from 'discord.js';

import { DiscordRestClient } from '@khlug/core/discord/DiscordRestClient';

import {
  DiscordUserIdMapperToken,
  IDiscordUserIdMapper,
} from '@khlug/app/infra/messenger/IDiscordUserIdMapper';
import { QueuedBaseMessenger } from '@khlug/app/infra/messenger/QueuedBaseMessenger';

import {
  MessengerSendParams,
  MessengerSendToChannelParams,
} from '@khlug/app/domain/adapter/IMessenger';

@Injectable()
export class DiscordMessenger extends QueuedBaseMessenger {
  constructor(
    private readonly restClient: DiscordRestClient,
    @Inject(DiscordUserIdMapperToken)
    private readonly discordUserIdMapper: IDiscordUserIdMapper,
  ) {
    super(new ConsoleLogger(DiscordMessenger.name));
  }

  protected async sendImpl({
    targetUserId,
    message,
  }: MessengerSendParams): Promise<void> {
    const discordUserId =
      await this.discordUserIdMapper.toDiscordUserId(targetUserId);

    if (!discordUserId) {
      return;
    }

    type CreateDMChannelResponse = { id: string };
    const response = await this.restClient.post<CreateDMChannelResponse>(
      Routes.userChannels(),
      { body: { recipient_id: discordUserId } },
    );

    const dmChannelId = response.id;
    await this.restClient.post(Routes.channelMessages(dmChannelId), {
      body: { content: message },
    });
  }

  protected async sendToChannelImpl(
    params: MessengerSendToChannelParams,
  ): Promise<void> {
    const { channelId, message } = params;

    await this.restClient.post(Routes.channelMessages(channelId), {
      body: { content: message },
    });
  }
}
