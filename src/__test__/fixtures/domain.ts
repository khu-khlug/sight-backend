import { faker } from '@faker-js/faker';

import { UserState } from '@sight/app/domain/user/model/constant';
import { Profile } from '@sight/app/domain/user/model/Profile';
import { User, UserConstructorParams } from '@sight/app/domain/user/model/User';

export function generateUser(params?: Partial<UserConstructorParams>): User {
  return new User({
    id: faker.number.int(),
    name: faker.lorem.word(),
    password: faker.lorem.word(),
    profile: new Profile({
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
    }),
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
  });
}
