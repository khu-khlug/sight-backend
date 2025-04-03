import { Injectable } from '@nestjs/common';

import { DiscordClient } from '@khlug/core/discord/DiscordClient';

@Injectable()
export class DiscordRestClient {
  constructor(private readonly discordClient: DiscordClient) {}

  async get<TRes = unknown>(
    ...params: Parameters<DiscordClient['rest']['get']>
  ) {
    return this.discordClient.rest.get(...params) as Promise<TRes>;
  }

  async post<TRes = unknown>(
    ...params: Parameters<DiscordClient['rest']['post']>
  ) {
    return this.discordClient.rest.post(...params) as Promise<TRes>;
  }

  async patch<TRes = unknown>(
    ...params: Parameters<DiscordClient['rest']['patch']>
  ) {
    return this.discordClient.rest.patch(...params) as Promise<TRes>;
  }

  async put<TRes = unknown>(
    ...params: Parameters<DiscordClient['rest']['put']>
  ) {
    return this.discordClient.rest.put(...params) as Promise<TRes>;
  }

  async delete<TRes = unknown>(
    ...params: Parameters<DiscordClient['rest']['delete']>
  ) {
    return this.discordClient.rest.delete(...params) as Promise<TRes>;
  }
}
