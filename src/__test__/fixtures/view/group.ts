import { faker } from '@faker-js/faker';

import { GroupListView } from '@khlug/app/application/group/query/view/GroupListView';
import { GroupMemberListView } from '@khlug/app/application/group/query/view/GroupMemberListView';
import { GroupMemberView } from '@khlug/app/application/group/query/view/GroupMemberView';
import { GroupView } from '@khlug/app/application/group/query/view/GroupView';

import {
  GroupCategory,
  GroupState,
} from '@khlug/app/domain/group/model/constant';

export function generateGroupView(params?: Partial<GroupView>): GroupView {
  return {
    id: faker.string.uuid(),
    category: faker.helpers.enumValue(GroupCategory),
    state: faker.helpers.enumValue(GroupState),
    title: faker.lorem.word(),
    authorUserId: faker.string.uuid(),
    adminUserId: faker.string.uuid(),
    purpose: faker.lorem.sentence(),
    technology: [faker.lorem.word()],
    lastUpdaterUserId: faker.string.uuid(),
    repository: faker.internet.url(),
    allowJoin: faker.datatype.boolean(),
    hasPortfolio: faker.datatype.boolean(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    ...params,
  };
}

export function generateGroupListView(
  params?: Partial<GroupListView>,
): GroupListView {
  const count = params?.count ?? faker.number.int({ min: 1, max: 5 });

  return {
    count,
    groups: Array.from({ length: count }, () => generateGroupView()),
    ...params,
  };
}

export function generateGroupMemberView(
  params?: Partial<GroupMemberView>,
): GroupMemberView {
  return {
    id: faker.string.uuid(),
    groupId: faker.string.uuid(),
    memberId: faker.string.uuid(),
    memberName: faker.lorem.word(),
    language: faker.lorem.word(),
    interests: [
      {
        id: faker.string.uuid(),
        name: faker.lorem.word(),
      },
    ],
    createdAt: faker.date.anytime(),
    ...params,
  };
}

export function generateGroupMemberListView(
  params?: Partial<GroupMemberListView>,
): GroupMemberListView {
  const count = params?.count ?? faker.number.int({ min: 1, max: 5 });

  return {
    count,
    groupMembers: Array.from({ length: count }, () =>
      generateGroupMemberView(),
    ),
    ...params,
  };
}
