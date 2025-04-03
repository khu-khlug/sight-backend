export const DiscordUserIdMapperToken = Symbol('DiscordUserIdMapper');

export interface IDiscordUserIdMapper {
  toDiscordUserId: (userId: number) => Promise<string | null>;
}
