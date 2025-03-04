import {
  ConsoleLogger,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

import { DiscordConfig } from '@khlug/core/config/DiscordConfig';

import { IDiscordAdapter } from '@khlug/app/application/adapter/IDiscordAdapter';

import { Message } from '@khlug/constant/message';

@Injectable()
export class DiscordAdapter implements IDiscordAdapter {
  private client: AxiosInstance;
  private config: DiscordConfig;
  private logger: ConsoleLogger;

  constructor(configService: ConfigService) {
    this.config = configService.getOrThrow<DiscordConfig>('discord');
    this.client = axios.create({
      baseURL: this.config.baseUrl,
    });
    this.logger = new ConsoleLogger(DiscordAdapter.name);
  }

  async getAccessToken(code: string): Promise<string> {
    try {
      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`,
      ).toString('base64');

      type OAuth2TokenResponse = { access_token: string };
      const response = await this.client.post<OAuth2TokenResponse>(
        '/oauth2/token',
        {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.config.redirectUrl,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        },
      );
      return response.data.access_token;
    } catch (e) {
      const error = e as Error;
      this.logger.error(error.message, error.stack);

      throw new UnprocessableEntityException(
        Message.DISCORD_INTEGRATION_FAILED,
      );
    }
  }

  async getCurrentUserId(accessToken: string): Promise<string> {
    try {
      type UserResponse = { id: string };
      const response = await this.client.get<UserResponse>('/users/@me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data.id;
    } catch (e) {
      const error = e as Error;
      this.logger.error(error.message, error.stack);

      throw new UnprocessableEntityException(
        Message.DISCORD_INTEGRATION_FAILED,
      );
    }
  }

  createOAuth2Url(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUrl,
      response_type: 'code',
      scope: 'identify',
      state,
    });
    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }
}
