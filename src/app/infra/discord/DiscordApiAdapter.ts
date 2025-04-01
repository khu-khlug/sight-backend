import {
  ConsoleLogger,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, isAxiosError } from 'axios';

import { DiscordConfig } from '@khlug/core/config/DiscordConfig';

import {
  DiscordApiModifyMemberParams,
  DiscordRole,
  IDiscordApiAdapter,
} from '@khlug/app/application/adapter/IDiscordApiAdapter';

import { Message } from '@khlug/constant/error';

@Injectable()
export class DiscordApiAdapter implements IDiscordApiAdapter {
  private readonly client: AxiosInstance;
  private readonly logger: ConsoleLogger;

  private readonly guildId: string;
  private readonly roleMap: Record<DiscordRole, string>;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<DiscordConfig>('discord');

    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        Authorization: `Bot ${config.botToken}`,
      },
    });
    this.logger = new ConsoleLogger(DiscordApiAdapter.name);

    this.guildId = config.khlugGuildId;
    this.roleMap = {
      [DiscordRole.MEMBER]: config.memberRoleId,
      [DiscordRole.GRADUATED_MEMBER]: config.graduatedMemberRoleId,
      [DiscordRole.MANAGER]: config.managerRoleId,
    };
  }

  async hasMember(discordUserId: string): Promise<boolean> {
    try {
      await this.client.get(`/guilds/${this.guildId}/members/${discordUserId}`);
      return true;
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 404) {
        return false;
      }

      const error = e as Error;
      this.logger.error(
        `Failed to get discord member${discordUserId}, ${error.message}`,
        error.stack,
      );
      throw new UnprocessableEntityException(Message.DISCORD_API_FAILED);
    }
  }

  async modifyMember(params: DiscordApiModifyMemberParams): Promise<void> {
    const { discordUserId, nickname, roles } = params;

    const body = {};

    if (nickname) {
      body['nick'] = nickname;
    }

    if (roles) {
      body['roles'] = roles.map((role) => this.roleMap[role]);
    }

    if (Object.keys(body).length === 0) {
      return;
    }

    try {
      await this.client.patch(
        `/guilds/${this.guildId}/members/${discordUserId}`,
        body,
      );
    } catch (e) {
      const error = e as Error;
      this.logger.error(
        `Failed to modify discord member${discordUserId}, ${error.message}`,
        error.stack,
      );

      throw new UnprocessableEntityException(Message.DISCORD_API_FAILED);
    }
  }
}
