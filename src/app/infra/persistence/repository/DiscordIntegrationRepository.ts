import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';

import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';
import { DiscordIntegrationMapper } from '@khlug/app/infra/persistence/repository/mapper/DiscordIntegrationMapper';

import { IDiscordIntegrationRepository } from '@khlug/app/domain/discord/IDiscordIntegrationRepository';
import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

export class DiscordIntegrationRepository
  implements IDiscordIntegrationRepository
{
  constructor(
    readonly mapper: DiscordIntegrationMapper,

    @InjectRepository(DiscordIntegrationEntity)
    private readonly discordIntegrationRepository: EntityRepository<DiscordIntegrationEntity>,
  ) {}

  async findByUserId(userId: number): Promise<DiscordIntegration | null> {
    const entity = await this.discordIntegrationRepository.findOne({ userId });

    if (!entity) {
      return null;
    }

    return this.mapper.toDomain(entity);
  }

  async insert(discordIntegration: DiscordIntegration): Promise<void> {
    const entity = this.mapper.toEntity(discordIntegration);
    await this.discordIntegrationRepository.insert(entity);
  }

  async remove(discordIntegration: DiscordIntegration): Promise<void> {
    const entity = this.mapper.toEntity(discordIntegration);

    const em = this.discordIntegrationRepository.getEntityManager();
    const ref = em.getReference(DiscordIntegrationEntity, entity.id);

    await this.discordIntegrationRepository
      .getEntityManager()
      .removeAndFlush(ref);
  }
}
