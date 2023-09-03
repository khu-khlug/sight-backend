import { User } from '@sight/app/domain/user/model/User';

import { testNow } from '@sight/__test__/constant';
import { DomainFixture } from '@sight/__test__/fixtures';

describe('User', () => {
  let user: User;

  beforeEach(() => {
    user = DomainFixture.generateUser();
  });

  describe('login', () => {
    test('로그인 할 때, lastLoginAt의 값이 지금 시각으로 변경되어야 한다', () => {
      user.login();

      expect(user.lastLoginAt).toEqual(testNow);
    });
  });
});
