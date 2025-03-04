import { DiscordIntegrationView } from '@khlug/app/application/user/query/view/DiscordIntegrationView';

export const DiscordIntegrationQueryToken = Symbol('DiscordIntegrationQuery');

export interface IDiscordIntegrationQuery {
  findByUserId: (userId: number) => Promise<DiscordIntegrationView | null>;
}
