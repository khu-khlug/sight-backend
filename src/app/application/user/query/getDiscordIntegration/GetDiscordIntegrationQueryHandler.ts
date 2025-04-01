import { Inject, NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetDiscordIntegrationQuery } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQuery';
import { GetDiscordIntegrationQueryResult } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryResult';
import {
  DiscordIntegrationQueryToken,
  IDiscordIntegrationQuery,
} from '@khlug/app/application/user/query/IDiscordIntegrationQuery';

import { Message } from '@khlug/constant/error';

@QueryHandler(GetDiscordIntegrationQuery)
export class GetDiscordIntegrationQueryHandler
  implements
    IQueryHandler<GetDiscordIntegrationQuery, GetDiscordIntegrationQueryResult>
{
  constructor(
    @Inject(DiscordIntegrationQueryToken)
    private readonly discordIntegrationQuery: IDiscordIntegrationQuery,
  ) {}

  async execute(
    query: GetDiscordIntegrationQuery,
  ): Promise<GetDiscordIntegrationQueryResult> {
    const { userId } = query;

    const view = await this.discordIntegrationQuery.findByUserId(userId);

    if (!view) {
      throw new NotFoundException(Message.DISCORD_INTEGRATION_NOT_FOUND);
    }

    return new GetDiscordIntegrationQueryResult(view);
  }
}
