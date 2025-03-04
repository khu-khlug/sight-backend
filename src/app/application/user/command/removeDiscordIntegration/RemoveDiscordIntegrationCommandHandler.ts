import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RemoveDiscordIntegrationCommand } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommand';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

import { Message } from '@khlug/constant/message';

@CommandHandler(RemoveDiscordIntegrationCommand)
export class RemoveDiscordIntegrationCommandHandler
  implements ICommandHandler<RemoveDiscordIntegrationCommand>
{
  constructor(
    @Inject(DiscordIntegrationRepositoryToken)
    private readonly discordIntegrationRepository: IDiscordIntegrationRepository,
  ) {}

  async execute(command: RemoveDiscordIntegrationCommand): Promise<void> {
    const { userId } = command;

    const discordIntegration =
      await this.discordIntegrationRepository.findByUserId(userId);
    if (!discordIntegration) {
      throw new NotFoundException(Message.DISCORD_INTEGRATION_NOT_FOUND);
    }

    await this.discordIntegrationRepository.remove(discordIntegration);
  }
}
