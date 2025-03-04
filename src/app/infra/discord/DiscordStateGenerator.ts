import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

import { DiscordConfig } from '@khlug/core/config/DiscordConfig';

import { IDiscordStateGenerator } from '@khlug/app/application/adapter/IDiscordStateGenerator';

@Injectable()
export class DiscordStateGenerator implements IDiscordStateGenerator {
  private readonly stateSecret: string;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<DiscordConfig>('discord');
    this.stateSecret = config.stateSecret;
  }

  generate(userId: number): string {
    return crypto
      .createHmac('sha256', this.stateSecret)
      .update(userId.toString())
      .digest('hex');
  }
}
