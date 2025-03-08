import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  DiscordOAuth2AdapterToken,
  IDiscordOAuth2Adapter,
} from '@khlug/app/application/adapter/IDiscordOAuth2Adapter';
import {
  DiscordStateGeneratorToken,
  IDiscordStateGenerator,
} from '@khlug/app/application/adapter/IDiscordStateGenerator';
import { CreateDiscordOAuth2UrlCommand } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOAuth2UrlCommand';
import { CreateDiscordOAuth2UrlCommandResult } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOauth2UrlCommandResult';

@CommandHandler(CreateDiscordOAuth2UrlCommand)
export class CreateDiscordOAuth2UrlCommandHandler
  implements
    ICommandHandler<
      CreateDiscordOAuth2UrlCommand,
      CreateDiscordOAuth2UrlCommandResult
    >
{
  constructor(
    @Inject(DiscordOAuth2AdapterToken)
    private readonly discordAdapter: IDiscordOAuth2Adapter,
    @Inject(DiscordStateGeneratorToken)
    private readonly discordStateGenerator: IDiscordStateGenerator,
  ) {}

  async execute(
    command: CreateDiscordOAuth2UrlCommand,
  ): Promise<CreateDiscordOAuth2UrlCommandResult> {
    const { userId } = command;

    const state = this.discordStateGenerator.generate(userId);
    const url = this.discordAdapter.createOAuth2Url(state);

    const result: CreateDiscordOAuth2UrlCommandResult = { url };
    return result;
  }
}
