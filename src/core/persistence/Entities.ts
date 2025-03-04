import { Cache } from '@khlug/app/domain/cache/model/Cache';
import { FeeHistory } from '@khlug/app/domain/fee/model/FeeHistory';
import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';
import { User } from '@khlug/app/domain/user/model/User';

export const EntityModels = [Cache, FeeHistory, DiscordIntegration, User];
