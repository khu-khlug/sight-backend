import { faker } from '@faker-js/faker';

import { Fee, FeeConstructorParams } from '@khlug/app/domain/fee/model/Fee';

export function generateFee(params: Partial<FeeConstructorParams> = {}): Fee {
  return new Fee({
    id: faker.number.int(),
    year: faker.date.anytime().getFullYear(),
    semester: faker.number.int({ min: 1, max: 2 }),
    user: faker.number.int(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}
