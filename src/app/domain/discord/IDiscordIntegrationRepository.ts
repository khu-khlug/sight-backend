import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

export const DiscordIntegrationRepositoryToken = Symbol(
  'DiscordIntegrationRepository',
);

export interface IDiscordIntegrationRepository {
  findByUserId: (userId: number) => Promise<DiscordIntegration | null>;
  findByDiscordUserId: (
    discordUserId: string,
  ) => Promise<DiscordIntegration | null>;
  insert: (discordIntegration: DiscordIntegration) => Promise<void>;
  remove: (discordIntegration: DiscordIntegration) => Promise<void>;
}
