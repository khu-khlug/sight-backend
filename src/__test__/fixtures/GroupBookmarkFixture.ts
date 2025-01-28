import { faker } from '@faker-js/faker';

import {
  GroupBookmark,
  GroupBookmarkConstructorParams,
} from '@khlug/app/domain/group/model/GroupBookmark';

function generator(
  params: Partial<GroupBookmarkConstructorParams> = {},
): GroupBookmark {
  return new GroupBookmark({
    id: faker.string.uuid(),
    userId: faker.number.int(),
    groupId: faker.string.uuid(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}

function normal(
  params: Partial<
    Pick<GroupBookmarkConstructorParams, 'userId' | 'groupId'>
  > = {},
): GroupBookmark {
  return generator(params);
}

export const GroupBookmarkFixture = {
  raw: generator,
  normal,
};
