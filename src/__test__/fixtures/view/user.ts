import { faker } from '@faker-js/faker';

import { InterestListView } from '@khlug/app/application/interest/query/view/InterestListView';
import { InterestView } from '@khlug/app/application/interest/query/view/InterestView';
import { UserListView } from '@khlug/app/application/user/query/view/UserListView';
import { UserView } from '@khlug/app/application/user/query/view/UserView';

import {
  StudentStatus,
  UserStatus,
} from '@khlug/app/domain/user/model/constant';

export function generateUserView(params?: Partial<UserView>): UserView {
  return {
    id: faker.number.int(),
    name: faker.lorem.word(),
    profile: {
      name: faker.person.fullName(),
      college: faker.lorem.word(),
      grade: faker.number.int(),
      number: faker.number.int(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      homepage: faker.internet.url(),
      language: faker.lorem.word(),
      prefer: faker.lorem.word(),
    },
    admission: faker.lorem.word(),
    studentStatus: faker.helpers.enumValue(StudentStatus),
    point: faker.number.int(),
    status: faker.helpers.enumValue(UserStatus),
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

export function generateInterestView(
  params?: Partial<InterestView>,
): InterestView {
  return {
    id: faker.number.int(),
    name: faker.lorem.word(),
    description: faker.lorem.paragraph(),
    createdAt: faker.date.anytime(),
    ...params,
  };
}

export function generateInterestListView(
  params?: Partial<InterestListView>,
): InterestListView {
  const count = params?.count ?? faker.number.int({ min: 1, max: 5 });

  return {
    count,
    interests: Array.from({ length: count }, () => generateInterestView()),
    ...params,
  };
}
