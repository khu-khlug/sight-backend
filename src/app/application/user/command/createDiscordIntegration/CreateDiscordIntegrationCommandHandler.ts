import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { ForbiddenException, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ulid } from 'ulid';

import {
  DiscordAdapterToken,
  IDiscordAdapter,
} from '@khlug/app/application/adapter/IDiscordAdapter';
import {
  DiscordStateGeneratorToken,
  IDiscordStateGenerator,
} from '@khlug/app/application/adapter/IDiscordStateGenerator';
import { CreateDiscordIntegrationCommand } from '@khlug/app/application/user/command/createDiscordIntegration/CreateDiscordIntegrationCommand';

import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

import { Message } from '@khlug/constant/message';

@CommandHandler(CreateDiscordIntegrationCommand)
export class CreateDiscordIntegrationCommandHandler
  implements ICommandHandler<CreateDiscordIntegrationCommand>
{
  constructor(
    @Inject(DiscordStateGeneratorToken)
    private readonly discordStateGenerator: IDiscordStateGenerator,
    @Inject(DiscordAdapterToken)
    private readonly discordAdapter: IDiscordAdapter,
    @InjectRepository(DiscordIntegration)
    private readonly discordIntegrationRepository: EntityRepository<DiscordIntegration>,
  ) {}

  async execute(command: CreateDiscordIntegrationCommand): Promise<void> {
    const { userId, code, state: givenState } = command;

    const state = this.discordStateGenerator.generate(userId);
    if (state !== givenState) {
      throw new ForbiddenException(Message.INVALID_DISCORD_STATE);
    }

    const prevDiscordIntegration =
      await this.discordIntegrationRepository.findOne({
        userId,
      });
    if (prevDiscordIntegration) {
      // 이미 존재한다면 무시합니다.
      return;
    }

    const accessToken = await this.discordAdapter.getAccessToken(code);
    const discordUserId =
      await this.discordAdapter.getCurrentUserId(accessToken);

    const newDiscordIntegration = new DiscordIntegration({
      id: ulid(),
      userId,
      discordUserId,
      createdAt: new Date(),
    });
    await this.discordIntegrationRepository.insert(newDiscordIntegration);
  }
}
