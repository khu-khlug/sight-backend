import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RemoveDiscordIntegrationCommand } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommand';

import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

import { Message } from '@khlug/constant/message';

@CommandHandler(RemoveDiscordIntegrationCommand)
export class RemoveDiscordIntegrationCommandHandler
  implements ICommandHandler<RemoveDiscordIntegrationCommand>
{
  constructor(
    @InjectRepository(DiscordIntegration)
    private readonly discordIntegrationRepository: EntityRepository<DiscordIntegration>,
  ) {}

  async execute(command: RemoveDiscordIntegrationCommand): Promise<void> {
    const { userId } = command;

    const discordIntegration = await this.discordIntegrationRepository.findOne({
      userId,
    });
    if (!discordIntegration) {
      throw new NotFoundException(Message.DISCORD_INTEGRATION_NOT_FOUND);
    }

    await this.discordIntegrationRepository
      .getEntityManager()
      .removeAndFlush(discordIntegration);
  }
}
