import { EntityManager } from '@mikro-orm/mysql';
import { Injectable } from '@nestjs/common';

import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';
import { DiscordIntegrationMapper } from '@khlug/app/infra/persistence/repository/mapper/DiscordIntegrationMapper';

import { IDiscordIntegrationRepository } from '@khlug/app/domain/discord/IDiscordIntegrationRepository';
import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

@Injectable()
export class DiscordIntegrationRepository
  implements IDiscordIntegrationRepository
{
  constructor(
    private readonly mapper: DiscordIntegrationMapper,
    private readonly entityManager: EntityManager,
  ) {}

  async findByUserId(userId: number): Promise<DiscordIntegration | null> {
    const entity = await this.entityManager.findOne(DiscordIntegrationEntity, {
      userId,
    });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
  }

  async findByDiscordUserId(
    discordUserId: string,
  ): Promise<DiscordIntegration | null> {
    const entity = await this.entityManager.findOne(DiscordIntegrationEntity, {
      discordUserId,
    });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
  }

  async save(discordIntegration: DiscordIntegration): Promise<void> {
    const entity = this.mapper.toEntity(discordIntegration);
    await this.entityManager.persistAndFlush(entity);
  }

  async remove(discordIntegration: DiscordIntegration): Promise<void> {
    const entity = this.mapper.toEntity(discordIntegration);
    await this.entityManager.removeAndFlush(entity);
  }
}
