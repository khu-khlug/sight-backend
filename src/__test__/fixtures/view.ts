import { faker } from '@faker-js/faker';

import { UserListView } from '@sight/app/application/user/query/view/UserListView';
import { UserView } from '@sight/app/application/user/query/view/UserView';

import { UserState } from '@sight/app/domain/user/model/constant';

export function generateUserView(params?: Partial<UserView>): UserView {
  return {
    id: faker.number.int(),
    name: faker.lorem.word(),
    password: faker.lorem.word(),
    profile: {
      name: faker.person.fullName(),
      college: faker.lorem.word(),
      grade: faker.number.int(),
      number: faker.number.int(),
      email: faker.internet.email(),
      phone: faker.phone.number('###-####-####'),
      homepage: faker.internet.url(),
      language: faker.lorem.word(),
      interest: faker.lorem.word(),
      prefer: faker.lorem.word(),
    },
    admission: faker.lorem.word(),
    state: faker.helpers.enumValue(UserState),
    point: faker.number.int(),
    active: faker.datatype.boolean(),
    manager: faker.datatype.boolean(),
    slack: faker.lorem.word(),
    rememberToken: faker.lorem.word(),
    khuisAuthAt: faker.date.anytime(),
    returnAt: faker.date.anytime(),
    returnReason: faker.lorem.word(),
    lastLoginAt: faker.date.anytime(),
    lastEnterAt: faker.date.anytime(),
    createdAt: faker.date.anytime(),
    updatedAt: faker.date.anytime(),
    ...params,
  };
}

export function generateUserListView(
  params?: Partial<UserListView>,
): UserListView {
  const count = params?.count ?? faker.number.int({ min: 1, max: 5 });

  return {
    count,
    users: Array.from({ length: count }, () => generateUserView()),
    ...params,
  };
}
