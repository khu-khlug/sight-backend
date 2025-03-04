import { Injectable } from '@nestjs/common';

import { IGenericMapper } from '@khlug/core/persistence/IGenericMapper';

import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';

import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

@Injectable()
export class DiscordIntegrationMapper
  implements IGenericMapper<DiscordIntegration, DiscordIntegrationEntity>
{
  toDomain(entity: DiscordIntegrationEntity): DiscordIntegration {
    return new DiscordIntegration({
      id: entity.id,
      userId: entity.userId,
      discordUserId: entity.discordUserId,
      createdAt: entity.createdAt,
    });
  }

  toEntity(domain: DiscordIntegration): DiscordIntegrationEntity {
    return {
      id: domain.id,
      userId: domain.userId,
      discordUserId: domain.discordUserId,
      createdAt: domain.createdAt,
    };
  }
}
