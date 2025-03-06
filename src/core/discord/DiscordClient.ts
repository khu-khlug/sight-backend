import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits } from 'discord.js';

import { DiscordConfig } from '@khlug/core/config/DiscordConfig';

@Injectable()
export class DiscordClient {
  private readonly client: Client;
  private readonly token: string;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<DiscordConfig>('discord');

    this.client = new Client({
      intents: [GatewayIntentBits.GuildMembers],
    });
    this.token = config.botToken;
  }

  on(...args: Parameters<Client['on']>) {
    return this.client.on(...args);
  }

  async login(): Promise<void> {
    await this.client.login(this.token);
  }
}
