import { Inject, Injectable } from '@nestjs/common';

import { IDiscordUserIdMapper } from '@khlug/app/infra/messenger/IDiscordUserIdMapper';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

type CachedDiscordUserId = {
  discordUserId: string;
  expiredAt: Date;
};

const CACHE_EXPIRATION_MS = 1000 * 60 * 60; // 1 hour

// TODO: 추후 디스코드 모듈로 분리 시 유저가 연동을 해제할 때 제거하도록 구현해야 함
@Injectable()
export class CachedDiscordUserIdMapper implements IDiscordUserIdMapper {
  private readonly cache = new Map<number, CachedDiscordUserId>();

  constructor(
    @Inject(DiscordIntegrationRepositoryToken)
    private readonly discordIntegrationRepository: IDiscordIntegrationRepository,
  ) {}

  async toDiscordUserId(userId: number): Promise<string | null> {
    const cachedDiscordUserId = this.getOrRemoveCacheIfStale(userId);

    if (cachedDiscordUserId) {
      return cachedDiscordUserId;
    }

    const discordUserId = await this.getDiscordUserIdFromRepository(userId);

    if (!discordUserId) {
      return null;
    }

    return discordUserId;
  }

  private getOrRemoveCacheIfStale(userId: number): string | null {
    const cache = this.cache.get(userId);

    if (cache && cache.expiredAt < new Date()) {
      this.cache.delete(userId);
      return null;
    }

    return cache?.discordUserId ?? null;
  }

  private async getDiscordUserIdFromRepository(
    userId: number,
  ): Promise<string | null> {
    const discordIntegration =
      await this.discordIntegrationRepository.findByUserId(userId);

    if (!discordIntegration) {
      return null;
    }

    const discordUserId = discordIntegration.discordUserId;
    this.saveToCache(userId, discordUserId);

    return discordUserId;
  }

  private saveToCache(userId: number, discordUserId: string): void {
    const expiredAt = new Date(Date.now() + CACHE_EXPIRATION_MS);
    this.cache.set(userId, { discordUserId, expiredAt });
  }
}
