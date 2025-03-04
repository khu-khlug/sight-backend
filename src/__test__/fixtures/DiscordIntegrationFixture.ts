import { faker } from '@faker-js/faker';
import { ulid } from 'ulid';

import {
  DiscordIntegration,
  DiscordIntegrationConstructorParams,
} from '@khlug/app/domain/discord/model/DiscordIntegration';

function generator(params: Partial<DiscordIntegrationConstructorParams> = {}) {
  return new DiscordIntegration({
    id: ulid(),
    userId: faker.number.int(),
    discordUserId: faker.string.numeric(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}

function normal() {
  return generator();
}

export const DiscordIntegrationFixture = {
  raw: generator,
  normal,
};
