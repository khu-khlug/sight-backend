import { faker } from '@faker-js/faker';

import {
  Cache,
  CacheConstructorParams,
} from '@khlug/app/domain/cache/model/Cache';

function generator(params: Partial<CacheConstructorParams> = {}): Cache {
  return new Cache({
    id: params.id ?? faker.string.numeric(3),
    name: params.name ?? faker.string.alpha(10),
    content: params.content ?? faker.string.alpha(10),
    updatedAt: params.updatedAt ?? new Date(),
  });
}

export const CacheFixture = {
  raw: generator,
};
