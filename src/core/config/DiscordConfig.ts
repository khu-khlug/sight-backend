export type DiscordConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  stateSecret: string;
  redirectUrl: string;
  botToken: string;

  khlugGuildId: string;
  memberRoleId: string;
  graduatedMemberRoleId: string;
  managerRoleId: string;
};

export const config = (): DiscordConfig => ({
  baseUrl: process.env.DISCORD_BASE_URL || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  stateSecret: process.env.DISCORD_STATE_SECRET || '',
  redirectUrl: process.env.DISCORD_REDIRECT_URL || '',
  botToken: process.env.DISCORD_BOT_TOKEN || '',

  khlugGuildId: process.env.KHLUG_DISCORD_GUILD_ID || '',
  memberRoleId: process.env.MEMBER_DISCORD_ROLE_ID || '',
  graduatedMemberRoleId: process.env.GRADUATED_MEMBER_DISCORD_ROLE_ID || '',
  managerRoleId: process.env.MANAGER_DISCORD_ROLE_ID || '',
});
