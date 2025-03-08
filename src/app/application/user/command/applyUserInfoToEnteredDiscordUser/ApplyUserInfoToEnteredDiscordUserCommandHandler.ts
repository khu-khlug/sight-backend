import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ApplyUserInfoToEnteredDiscordUserCommand } from '@khlug/app/application/user/command/applyUserInfoToEnteredDiscordUser/ApplyUserInfoToEnteredDiscordUserCommand';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

@CommandHandler(ApplyUserInfoToEnteredDiscordUserCommand)
export class ApplyUserInfoToEnteredDiscordUserCommandHandler
  implements ICommandHandler<ApplyUserInfoToEnteredDiscordUserCommand>
{
  constructor(
    private readonly discordMemberService: DiscordMemberService,
    @Inject(DiscordIntegrationRepositoryToken)
    private readonly discordIntegrationRepository: IDiscordIntegrationRepository,
  ) {}

  async execute(
    command: ApplyUserInfoToEnteredDiscordUserCommand,
  ): Promise<void> {
    const { discordUserId } = command;

    const discordIntegration =
      await this.discordIntegrationRepository.findByDiscordUserId(
        discordUserId,
      );
    if (!discordIntegration) {
      return;
    }

    const userId = discordIntegration.userId;
    await this.discordMemberService.reflectUserInfoToDiscordUser(userId);
  }
}
