export const DiscordOAuth2AdapterToken = Symbol('DiscordOAuth2Adapter');

export interface IDiscordOAuth2Adapter {
  getAccessToken: (code: string) => Promise<string>;
  getCurrentUserId: (accessToken: string) => Promise<string>;
  createOAuth2Url: (state: string) => string;
}
