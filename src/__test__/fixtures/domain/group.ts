import { faker } from '@faker-js/faker';

import {
  GroupAccessGrade,
  GroupCategory,
  GroupState,
} from '@sight/app/domain/group/model/constant';
import {
  Group,
  GroupConstructorParams,
} from '@sight/app/domain/group/model/Group';
import {
  GroupMember,
  GroupMemberConstructorParams,
} from '@sight/app/domain/group/model/GroupMember';
import {
  GroupInterest,
  GroupInterestConstructorParams,
} from '@sight/app/domain/interest/model/GroupInterest';

export function generateGroup(params?: Partial<GroupConstructorParams>): Group {
  return new Group({
    id: faker.string.uuid(),
    category: faker.helpers.enumValue(GroupCategory),
    state: faker.helpers.enumValue(GroupState),
    title: faker.lorem.word(),
    authorUserId: faker.string.uuid(),
    adminUserId: faker.string.uuid(),
    purpose: faker.lorem.sentence(),
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

export function generateGroupMember(
  params?: Partial<GroupMemberConstructorParams>,
): GroupMember {
  return new GroupMember({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    groupId: faker.string.uuid(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}

export function generateGroupInterest(
  params?: Partial<GroupInterestConstructorParams>,
): GroupInterest {
  return new GroupInterest({
    id: faker.string.uuid(),
    interestId: faker.string.uuid(),
    groupId: faker.string.uuid(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}