import { DiscordIntegrationEntity } from '@khlug/app/infra/persistence/entity/DiscordIntegrationEntity';

import { Cache } from '@khlug/app/domain/cache/model/Cache';
import { FeeHistory } from '@khlug/app/domain/fee/model/FeeHistory';
import { User } from '@khlug/app/domain/user/model/User';

export const EntityModels = [Cache, FeeHistory, DiscordIntegrationEntity, User];
