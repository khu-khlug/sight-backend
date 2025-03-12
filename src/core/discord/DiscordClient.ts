import { ConsoleLogger, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits } from 'discord.js';

import { DiscordConfig } from '@khlug/core/config/DiscordConfig';

@Injectable()
export class DiscordClient {
  private readonly client: Client;
  private readonly token: string;
  private readonly logger: ConsoleLogger;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<DiscordConfig>('discord');

    this.client = new Client({
      intents: [GatewayIntentBits.GuildMembers],
    });
    this.token = config.botToken;
    this.logger = new ConsoleLogger(DiscordClient.name);
  }

  on(...args: Parameters<Client['on']>) {
    return this.client.on(...args);
  }

  async login(): Promise<void> {
    if (!this.token) {
      this.logger.warn(
        '디스코드 봇 토큰이 누락되어 디스코드 클라이언트의 로그인을 수행하지 않습니다.',
      );
      return;
    }

    await this.client.login(this.token);
  }
}
