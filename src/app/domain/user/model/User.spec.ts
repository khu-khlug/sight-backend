import { advanceTo, clear } from 'jest-date-mock';

import { UserState } from '@khlug/app/domain/user/model/constant';
import { User } from '@khlug/app/domain/user/model/User';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { Message } from '@khlug/constant/message';

describe('User', () => {
  let user: User;

  const now = new Date();

  beforeEach(() => {
    advanceTo(now);

    user = DomainFixture.generateUser({ state: UserState.UNDERGRADUATE });
  });

  afterAll(() => {
    clear();
  });

  describe('setProfile', () => {
    const email = 'some@email.com';
    const grade = 1;
    const name = '김러리';

    test('교류 회원이 이메일 외에 다른 정보를 변경할 때, 예외를 발생시켜야 한다', () => {
      user = DomainFixture.generateUser({ state: UserState.UNITED });

      expect(() => user.setProfile({ phone: '010-0000-0000' })).toThrowError(
        Message.UNITED_USER_CAN_ONLY_CHANGE_EMAIL,
      );
    });

    test('졸업 상태가 아닌 유저가 전화번호를 변경할 때, 예외를 발생시켜야 한다', () => {
      user = DomainFixture.generateUser({ state: UserState.UNDERGRADUATE });

      expect(() => user.setProfile({ phone: '010-0000-0000' })).toThrowError(
        Message.GRADUATED_USER_ONLY_CAN_CHANGE_EMAIL,
      );
    });

    test('주어진 프로필 정보로 유저의 프로필을 수정해야 한다', () => {
      user.setProfile({ email, grade, name });

      expect(user.profile.email).toEqual(email);
      expect(user.profile.grade).toEqual(grade);
      expect(user.profile.name).toEqual(name);
    });

    test('수정 후, updatedAt의 값이 갱신돼야 한다', () => {
      user.setProfile({ email, grade, name });
      expect(user.updatedAt).toEqual(now);
    });
  });

  describe('login', () => {
    test('로그인 할 때, lastLoginAt의 값이 지금 시각으로 변경되어야 한다', () => {
      user.login();
      expect(user.lastLoginAt).toEqual(now);
    });

    test('로그인 할 때, updatedAt의 값이 갱신돼야 한다', () => {
      user.login();
      expect(user.updatedAt).toEqual(now);
    });
  });

  describe('grantPoint', () => {
    test('포인트를 부여해야 한다', async () => {
      const user = DomainFixture.generateUser({ point: 100 });
      const point = 1000;

      user.grantPoint(point);

      expect(user.point).toEqual(1100);
    });
  });
});
