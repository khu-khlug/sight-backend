import { faker } from '@faker-js/faker';

import {
  StudentStatus,
  UserStatus,
} from '@khlug/app/domain/user/model/constant';
import {
  PointHistory,
  PointHistoryConstructorParams,
} from '@khlug/app/domain/user/model/PointHistory';
import {
  Profile,
  ProfileConstructorParams,
} from '@khlug/app/domain/user/model/Profile';
import { User, UserConstructorParams } from '@khlug/app/domain/user/model/User';

export function generateUser(
  params: Partial<UserConstructorParams> = {},
): User {
  return new User({
    id: faker.number.int(),
    name: faker.lorem.word(),
    password: faker.lorem.word(),
    profile: generateProfile(),
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
  });
}

function stopped(params: Partial<UserConstructorParams> = {}) {
  return generateUser({
    returnAt: new Date(),
    ...params,
  });
}

export function generateProfile(
  params: Partial<ProfileConstructorParams> = {},
): Profile {
  return new Profile({
    name: faker.person.fullName(),
    college: faker.lorem.word(),
    grade: faker.number.int(),
    number: faker.number.int(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    homepage: faker.internet.url(),
    language: faker.lorem.word(),
    prefer: faker.lorem.word(),
    ...params,
  });
}

export function generatePointHistory(
  params: Partial<PointHistoryConstructorParams> = {},
): PointHistory {
  return new PointHistory({
    id: faker.string.uuid(),
    userId: faker.number.int(),
    point: faker.number.int(),
    reason: faker.lorem.sentence(),
    createdAt: faker.date.anytime(),
    ...params,
  });
}

export const UserFixture = {
  raw: generateUser,
  stopped,
};
