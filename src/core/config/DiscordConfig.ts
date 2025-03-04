export type DiscordConfig = {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  stateSecret: string;
  redirectUrl: string;
};

export const config = (): DiscordConfig => ({
  baseUrl: process.env.DISCORD_BASE_URL || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  stateSecret: process.env.DISCORD_STATE_SECRET || '',
  redirectUrl: process.env.DISCORD_REDIRECT_URL || '',
});
