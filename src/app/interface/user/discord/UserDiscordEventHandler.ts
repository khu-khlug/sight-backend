import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Events, GuildMember } from 'discord.js';

import { DiscordEventHandler } from '@khlug/core/discord/DiscordEventHandler';

import { ApplyUserInfoToEnteredDiscordUserCommand } from '@khlug/app/application/user/command/applyUserInfoToEnteredDiscordUser/ApplyUserInfoToEnteredDiscordUserCommand';

@Injectable()
export class UserDiscordEventHandler {
  constructor(private readonly commandBus: CommandBus) {}

  @DiscordEventHandler(Events.GuildMemberAdd)
  async hello(member: GuildMember): Promise<void> {
    const discordUserId = member.user.id;
    const command = new ApplyUserInfoToEnteredDiscordUserCommand(discordUserId);
    await this.commandBus.execute(command);
  }
}
