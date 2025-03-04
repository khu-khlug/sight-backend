import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';

import { IDiscordIntegrationQuery } from '@khlug/app/application/user/query/IDiscordIntegrationQuery';
import { DiscordIntegrationView } from '@khlug/app/application/user/query/view/DiscordIntegrationView';

@Injectable()
export class DiscordIntegrationQuery implements IDiscordIntegrationQuery {
  constructor(
    @InjectRepository(DiscordIntegrationEntity)
    private readonly discordIntegrationRepository: EntityRepository<DiscordIntegrationEntity>,
  ) {}

  async findByUserId(userId: number): Promise<DiscordIntegrationView | null> {
    const discordIntegration = await this.discordIntegrationRepository.findOne({
      userId,
    });

    if (!discordIntegration) {
      return null;
    }

    return discordIntegration;
  }
}
