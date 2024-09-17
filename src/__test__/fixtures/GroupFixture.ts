import { faker } from '@faker-js/faker';
import {
  CUSTOMER_SERVICE_GROUP_ID,
  GroupAccessGrade,
  GroupCategory,
  GroupState,
  PRACTICE_GROUP_ID,
} from '@sight/app/domain/group/model/constant';

import {
  Group,
  GroupConstructorParams,
} from '@sight/app/domain/group/model/Group';

function generator(params: Partial<GroupConstructorParams> = {}): Group {
  return new Group({
    id: faker.string.uuid(),
    category: faker.helpers.enumValue(GroupCategory),
    state: faker.helpers.enumValue(GroupState),
    title: faker.lorem.word(),
    authorUserId: faker.string.uuid(),
    adminUserId: faker.string.uuid(),
    purpose: faker.lorem.sentence(),
    interestIds: [faker.string.uuid()],
    technology: [faker.lorem.word()],
    grade: faker.helpers.enumValue(GroupAccessGrade),
    lastUpdaterUserId: faker.string.uuid(),
    repository: faker.internet.url(),
    allowJoin: faker.datatype.boolean(),
    hasPortfolio: faker.datatype.boolean(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    ...params,
  });
}

function inProgressJoinable(
  params: Partial<GroupConstructorParams> = {},
): Group {
  return generator({
    state: GroupState.PROGRESS,
    grade: GroupAccessGrade.MEMBER,
    allowJoin: true,
    ...params,
  });
}

function suspended(params: Partial<GroupConstructorParams> = {}): Group {
  return generator({
    state: GroupState.SUSPEND,
    ...params,
  });
}

function successfullyEnd(params: Partial<GroupConstructorParams> = {}): Group {
  return generator({
    state: GroupState.END_SUCCESS,
    ...params,
  });
}

function customerService(params: Partial<GroupConstructorParams> = {}): Group {
  return generator({
    id: CUSTOMER_SERVICE_GROUP_ID,
    ...params,
  });
}

function practice(params: Partial<GroupConstructorParams> = {}): Group {
  return generator({
    id: PRACTICE_GROUP_ID,
    ...params,
  });
}

export const GroupFixture = {
  raw: generator,
  inProgressJoinable,
  successfullyEnd,
  suspended,
  customerService,
  practice,
};
