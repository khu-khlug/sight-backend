export const DiscordAdapterToken = Symbol('DiscordAdapter');

export interface IDiscordAdapter {
  getAccessToken: (code: string) => Promise<string>;
  getCurrentUserId: (accessToken: string) => Promise<string>;
  createOAuth2Url: (state: string) => string;
}
