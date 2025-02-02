import { faker } from '@faker-js/faker';

import {
  FeeHistory,
  FeeHistoryConstructorParams,
} from '@khlug/app/domain/fee/model/FeeHistory';

export function generateFeeHistory(
  params: Partial<FeeHistoryConstructorParams> = {},
): FeeHistory {
  return new FeeHistory({
    id: faker.number.int(),
    year: faker.date.anytime().getFullYear(),
    semester: faker.number.int({ min: 1, max: 2 }),
    user: faker.number.int(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}
