import { DomainFixture } from '@sight/__test__/fixtures';

import { User } from '@sight/app/domain/user/model/User';
import { advanceTo, clear } from 'jest-date-mock';

describe('User', () => {
  let user: User;

  const now = new Date();

  beforeEach(() => {
    advanceTo(now);

    user = DomainFixture.generateUser();
  });

  afterAll(() => {
    clear();
  });

  describe('login', () => {
    test('로그인 할 때, lastLoginAt의 값이 지금 시각으로 변경되어야 한다', () => {
      user.login();

      expect(user.lastLoginAt).toEqual(now);
    });
  });
});
