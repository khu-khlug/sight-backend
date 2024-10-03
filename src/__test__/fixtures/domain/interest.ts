import { faker } from '@faker-js/faker';

import {
  Interest,
  InterestConstructorParams,
} from '@khlug/app/domain/interest/model/Interest';

export function generateInterest(
  params?: Partial<InterestConstructorParams>,
): Interest {
  return new Interest({
    id: faker.string.uuid(),
    name: faker.lorem.word(),
    description: faker.lorem.paragraph(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}
