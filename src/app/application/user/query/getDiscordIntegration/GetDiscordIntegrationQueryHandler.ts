import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { NotFoundException } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetDiscordIntegrationQuery } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQuery';
import { GetDiscordIntegrationQueryResult } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryResult';

import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

import { Message } from '@khlug/constant/message';

@QueryHandler(GetDiscordIntegrationQuery)
export class GetDiscordIntegrationQueryHandler
  implements
    IQueryHandler<GetDiscordIntegrationQuery, GetDiscordIntegrationQueryResult>
{
  constructor(
    @InjectRepository(DiscordIntegration)
    private readonly discordIntegrationRepository: EntityRepository<DiscordIntegration>,
  ) {}

  async execute(
    query: GetDiscordIntegrationQuery,
  ): Promise<GetDiscordIntegrationQueryResult> {
    const { userId } = query;

    const discordIntegration = await this.discordIntegrationRepository.findOne({
      userId,
    });

    if (!discordIntegration) {
      throw new NotFoundException(Message.DISCORD_INTEGRATION_NOT_FOUND);
    }

    const result: GetDiscordIntegrationQueryResult = { discordIntegration };
    return result;
  }
}
