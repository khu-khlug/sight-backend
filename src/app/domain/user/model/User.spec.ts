import dayjs from 'dayjs';
import { advanceTo, clear } from 'jest-date-mock';

import { StudentStatus } from '@khlug/app/domain/user/model/constant';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { generateProfile } from '@khlug/__test__/fixtures/domain';
import { Message } from '@khlug/constant/message';

describe('User', () => {
  const now = new Date();

  const createKstDate = (date: string) => dayjs.tz(date, 'Asia/Seoul').toDate();

  beforeEach(() => {
    advanceTo(now);
  });

  afterEach(() => {
    clear();
  });

  describe('setProfile', () => {
    const email = 'some@email.com';
    const grade = 1;
    const name = '김러리';

    test('교류 회원이 이메일 외에 다른 정보를 변경할 때, 예외를 발생시켜야 한다', () => {
      const user = DomainFixture.generateUser({
        studentStatus: StudentStatus.UNITED,
      });

      expect(() => user.setProfile({ phone: '010-0000-0000' })).toThrowError(
        Message.UNITED_USER_CAN_ONLY_CHANGE_EMAIL,
      );
    });

    test('졸업 상태가 아닌 유저가 전화번호를 변경할 때, 예외를 발생시켜야 한다', () => {
      const user = DomainFixture.generateUser({
        studentStatus: StudentStatus.UNDERGRADUATE,
      });

      expect(() => user.setProfile({ phone: '010-0000-0000' })).toThrowError(
        Message.GRADUATED_USER_ONLY_CAN_CHANGE_EMAIL,
      );
    });

    test('주어진 프로필 정보로 유저의 프로필을 수정해야 한다', () => {
      const user = DomainFixture.generateUser({
        studentStatus: StudentStatus.UNDERGRADUATE,
      });

      user.setProfile({ email, grade, name });

      expect(user.profile.email).toEqual(email);
      expect(user.profile.grade).toEqual(grade);
      expect(user.profile.name).toEqual(name);
    });

    test('수정 후, updatedAt의 값이 갱신돼야 한다', () => {
      const user = DomainFixture.generateUser({
        studentStatus: StudentStatus.UNDERGRADUATE,
      });

      user.setProfile({ email, grade, name });
      expect(user.updatedAt).toEqual(now);
    });
  });

  describe('login', () => {
    test('로그인 할 때, lastLoginAt의 값이 지금 시각으로 변경되어야 한다', () => {
      const user = DomainFixture.generateUser({
        studentStatus: StudentStatus.UNDERGRADUATE,
      });

      user.login();

      expect(user.lastLoginAt).toEqual(now);
    });

    test('로그인 할 때, updatedAt의 값이 갱신돼야 한다', () => {
      const user = DomainFixture.generateUser({
        studentStatus: StudentStatus.UNDERGRADUATE,
      });

      user.login();

      expect(user.updatedAt).toEqual(now);
    });
  });

  describe('grantPoint', () => {
    test('포인트를 부여해야 한다', () => {
      const user = DomainFixture.generateUser({ point: 100 });
      const point = 1000;

      user.grantPoint(point);

      expect(user.point).toEqual(1100);
    });
  });

  describe('isStopped', () => {
    test('복귀 일자가 존재한다면 `true`를 반환해야 한다', () => {
      const user = DomainFixture.generateUser({ returnAt: new Date() });
      expect(user.isStopped()).toEqual(true);
    });

    test('복귀 일자가 존재하지 않는다면 `false`를 반환해야 한다', () => {
      const user = DomainFixture.generateUser({ returnAt: null });
      expect(user.isStopped()).toEqual(false);
    });
  });

  describe('needAuth', () => {
    describe('대상 유저가 아닌 경우', () => {
      test('교류 유저라면 `false`를 반환해야 한다', () => {
        const user = DomainFixture.generateUser({
          studentStatus: StudentStatus.UNITED,
        });
        expect(user.needAuth()).toEqual(false);
      });

      test('졸업한 유저라면 `false`를 반환해야 한다', () => {
        const user = DomainFixture.generateUser({
          studentStatus: StudentStatus.GRADUATE,
        });
        expect(user.needAuth()).toEqual(false);
      });

      test('정지 상태의 유저라면 `false`를 반환해야 한다', () => {
        const user = DomainFixture.generateUser({ returnAt: new Date() });
        expect(user.needAuth()).toEqual(false);
      });
    });

    describe('대상 유저인 경우', () => {
      const createTargetUser = (khuisAuthAt: Date) =>
        DomainFixture.generateUser({
          studentStatus: StudentStatus.UNDERGRADUATE,
          returnAt: null,
          khuisAuthAt,
        });

      describe('동년도 1학기 시작 전에 인증한 경우', () => {
        test('2025년 1월 1일(2학기 중)에 인증했고, 오늘이 2025년 2월 1일(2학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-01-01'));
          advanceTo(createKstDate('2025-02-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 1월 1일(2학기 중)에 인증했고, 오늘이 2025년 2월 25일(1학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          // 2학기 인증은 내년 3월 1일까지는 유효하므로 `false`가 반환되어야 합니다.
          const user = createTargetUser(createKstDate('2025-01-01'));
          advanceTo(createKstDate('2025-02-25'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 1월 1일(2학기 중)에 인증했고, 오늘이 2025년 5월 1일(1학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-01-01'));
          advanceTo(createKstDate('2025-05-01'));

          expect(user.needAuth()).toEqual(true);
        });

        test('2025년 1월 1일(2학기 중)에 인증했고, 오늘이 2025년 10월 1일(2학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-01-01'));
          advanceTo(createKstDate('2025-10-01'));

          expect(user.needAuth()).toEqual(true);
        });
      });

      describe('1학기 인증 기간 중에 인증한 경우', () => {
        test('2025년 2월 25일(1학기 인증 중)에 인증했고, 오늘이 2025년 2월 28일(1학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-02-25'));
          advanceTo(createKstDate('2025-02-28'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 2월 25일(1학기 인증 중)에 인증했고, 오늘이 2025년 5월 1일(1학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-02-25'));
          advanceTo(createKstDate('2025-05-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 2월 25일(1학기 인증 중)에 인증했고, 오늘이 2025년 8월 25일(2학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          // 1학기 인증은 올해 8월 31일까지 유효하므로 `false`가 반환되어야 합니다.
          const user = createTargetUser(createKstDate('2025-02-25'));
          advanceTo(createKstDate('2025-08-25'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 2월 25일(1학기 인증 중)에 인증했고, 오늘이 2025년 10월 1일(2학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-02-25'));
          advanceTo(createKstDate('2025-10-01'));

          expect(user.needAuth()).toEqual(true);
        });
      });

      describe('1학기 중에 인증한 경우', () => {
        test('2025년 5월 1일(1학기 중)에 인증했고, 오늘이 2025년 6월 1일(1학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-05-01'));
          advanceTo(createKstDate('2025-06-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 5월 1일(1학기 중)에 인증했고, 오늘이 2025년 8월 25일(2학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          // 1학기 인증은 올해 8월 31일까지 유효하므로 `false`가 반환되어야 합니다.
          const user = createTargetUser(createKstDate('2025-05-01'));
          advanceTo(createKstDate('2025-08-25'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 5월 1일(1학기 중)에 인증했고, 오늘이 2025년 10월 1일(2학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-05-01'));
          advanceTo(createKstDate('2025-10-01'));

          expect(user.needAuth()).toEqual(true);
        });

        test('2025년 5월 1일(1학기 중)에 인증했고, 오늘이 2026년 5월 1일(내년 1학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-05-01'));
          advanceTo(createKstDate('2026-05-01'));

          expect(user.needAuth()).toEqual(true);
        });
      });

      describe('2학기 인증 기간 중에 인증한 경우', () => {
        test('2025년 8월 25일(2학기 인증 중)에 인증했고, 오늘이 2025년 8월 29일(2학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-08-25'));
          advanceTo(createKstDate('2025-08-29'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 8월 25일(2학기 인증 중)에 인증했고, 오늘이 2025년 10월 1일(2학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-08-25'));
          advanceTo(createKstDate('2025-10-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 8월 25일(2학기 인증 중)에 인증했고, 오늘이 2026년 1월 1일(2학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-08-25'));
          advanceTo(createKstDate('2026-01-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 8월 25일(2학기 인증 중)에 인증했고, 오늘이 2026년 2월 25일(1학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          // 2학기 인증은 내년 3월 1일까지는 유효하므로 `false`가 반환되어야 합니다.
          const user = createTargetUser(createKstDate('2025-08-25'));
          advanceTo(createKstDate('2026-02-25'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 8월 25일(2학기 인증 중)에 인증했고, 오늘이 2026년 5월 1일(1학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-08-25'));
          advanceTo(createKstDate('2026-05-01'));

          expect(user.needAuth()).toEqual(true);
        });
      });

      describe('2학기 중에 인증한 경우', () => {
        test('2025년 10월 1일(2학기 중)에 인증했고, 오늘이 2025년 11월 1일(2학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-10-01'));
          advanceTo(createKstDate('2025-11-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 10월 1일(2학기 중)에 인증했고, 오늘이 2026년 1월 1일(2학기 중)이라면, `false`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-10-01'));
          advanceTo(createKstDate('2026-01-01'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 10월 1일(2학기 중)에 인증했고, 오늘이 2026년 2월 25일(내년 1학기 인증 중)이라면, `false`를 반환해야 한다', () => {
          // 2학기 인증은 내년 3월 1일까지는 유효하므로 `false`가 반환되어야 합니다.
          const user = createTargetUser(createKstDate('2025-10-01'));
          advanceTo(createKstDate('2026-02-25'));

          expect(user.needAuth()).toEqual(false);
        });

        test('2025년 10월 1일(2학기 중)에 인증했고, 오늘이 2026년 5월 1일(내년 1학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-10-01'));
          advanceTo(createKstDate('2026-05-01'));

          expect(user.needAuth()).toEqual(true);
        });

        test('2025년 10월 1일(2학기 중)에 인증했고, 오늘이 2026년 10월 1일(내년 2학기 중)이라면, `true`를 반환해야 한다', () => {
          const user = createTargetUser(createKstDate('2025-10-01'));
          advanceTo(createKstDate('2026-10-01'));

          expect(user.needAuth()).toEqual(true);
        });
      });
    });
  });

  describe('needPayFee', () => {
    const createUser = (
      params: Partial<{
        studentStatus: StudentStatus;
        manager: boolean;
        grade: number;
        createdAt: Date;
      }> = {},
    ) =>
      DomainFixture.generateUser({
        studentStatus: params.studentStatus ?? StudentStatus.UNDERGRADUATE,
        manager: params.manager ?? false,
        profile: generateProfile({ grade: params.grade ?? 1 }),
        createdAt: params.createdAt ?? new Date('2025-05-01'),
      });

    test('재학 중이 아닌 경우 `false`를 반환해야 한다', () => {
      const user = createUser({ studentStatus: StudentStatus.GRADUATE });
      expect(user.needPayFee()).toEqual(false);
    });

    test('운영진인 경우 `false`를 반환해야 한다', () => {
      const user = createUser({ manager: true });
      expect(user.needPayFee()).toEqual(false);
    });

    test('4학년인 경우 `false`를 반환해야 한다', () => {
      const user = createUser({ grade: 4 });
      expect(user.needPayFee()).toEqual(false);
    });

    test('등록한지 309일이 안 된 경우 `false`를 반환해야 한다', () => {
      const user = createUser({
        createdAt: dayjs().subtract(308, 'days').toDate(),
      });
      expect(user.needPayFee()).toEqual(false);
    });

    test('회비 납부 대상인 경우 `true`를 반환해야 한다', () => {
      const user = createUser({ createdAt: createKstDate('2024-05-01') });
      advanceTo(createKstDate('2025-05-01'));
      expect(user.needPayFee()).toEqual(true);
    });
  });
});
