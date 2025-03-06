import { Injectable } from '@nestjs/common';
import { Events, GuildMember } from 'discord.js';

import { DiscordEventHandler } from '@khlug/core/discord/DiscordEventHandler';

@Injectable()
export class UserDiscordEventHandler {
  @DiscordEventHandler(Events.GuildMemberAdd)
  async hello(member: GuildMember): Promise<void> {
    console.log('Hello', member.id);
  }
}
