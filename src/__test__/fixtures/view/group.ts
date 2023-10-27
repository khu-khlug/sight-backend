import { faker } from '@faker-js/faker';

import { GroupListView } from '@sight/app/application/group/query/view/GroupListView';
import { GroupView } from '@sight/app/application/group/query/view/GroupView';

import {
  GroupCategory,
  GroupState,
} from '@sight/app/domain/group/model/constant';

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
