import dayjs from 'dayjs';
import { advanceTo, clear } from 'jest-date-mock';

import { StudentStatus } from '@khlug/app/domain/user/model/constant';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { generateProfile, UserFixture } from '@khlug/__test__/fixtures/domain';
import { Message } from '@khlug/constant/error';
import { UnivDate } from '@khlug/util/univDate';
import { UnivTerm } from '@khlug/util/univTerm';

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
        returnAt: null,
      });

    test('정지 상태인 경우 `false`를 반환해야 한다', () => {
      const user = UserFixture.stopped();
      expect(user.needPayFee()).toEqual(false);
    });

    test('재학 중이 아닌 경우 `false`를 반환해야 한다', () => {
      const user = UserFixture.graduated();
      expect(user.needPayFee()).toEqual(false);
    });

    test('운영진인 경우 `false`를 반환해야 한다', () => {
      const user = createUser({ manager: true });
      expect(user.needPayFee()).toEqual(false);
    });

    test('학기 중 등록 후 2번의 종강일을 지났으며 4학년인 경우, `false`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: createKstDate('2024-05-01'),
      });
      advanceTo(createKstDate('2025-05-01'));

      // 2024년 1학기와 2024년 2학기 종강일을 지났고 4학년이므로 `false`가 반환되어야 합니다.
      expect(user.needPayFee()).toEqual(false);
    });

    test('종강일에 등록 후 그 다음 학기의 종강일을 지났으며 4학년인 경우, `false`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: UnivDate.calcFinalExamEndDate(new UnivTerm(2024, 1)),
      });
      advanceTo(createKstDate('2025-05-01'));

      // 2024년 1학기와 2024년 2학기 종강일을 지났고 4학년이므로 `false`가 반환되어야 합니다.
      expect(user.needPayFee()).toEqual(false);
    });

    test('방학 중 등록 후 2번의 종강일을 지났으며 4학년인 경우, `false`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: createKstDate('2024-02-01'),
      });
      advanceTo(createKstDate('2025-05-01'));

      // 2024년 1학기와 2024년 2학기 종강일을 지났고 4학년이므로 `false`가 반환되어야 합니다.
      expect(user.needPayFee()).toEqual(false);
    });

    test('학기 중 등록 후 2번의 종강일을 지나지 않았으며 4학년인 경우, `true`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: createKstDate('2024-05-01'),
      });
      advanceTo(createKstDate('2024-10-01'));

      // 2024년 1학기 종강일만 지났으므로 `true`가 반환되어야 합니다.
      expect(user.needPayFee()).toEqual(true);
    });

    test('종강일에 등록 후 그 다음 학기의 종강일을 지나지 않았으며 4학년인 경우, `true`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: UnivDate.calcFinalExamEndDate(new UnivTerm(2024, 1)),
      });
      advanceTo(createKstDate('2024-10-01'));

      // 2024년 1학기 종강일만 지났으므로 `true`가 반환되어야 합니다.
      expect(user.needPayFee()).toEqual(true);
    });

    test('방학 중 등록 후 2번의 종강일을 지나지 않았으며 4학년인 경우, `true`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: createKstDate('2024-02-01'),
      });
      advanceTo(createKstDate('2024-10-30'));

      // 2025년 1학기 종강일만 지났으므로 `true`가 반환되어야 합니다.
      expect(user.needPayFee()).toEqual(true);
    });

    test.each([
      [createKstDate('2024-02-01')], // 2023년 겨울 방학 중
      [UnivDate.calcSemesterStartDate(new UnivTerm(2024, 1))], // 2024년 1학기 개강일
      [createKstDate('2024-05-01')], // 2024년 1학기 중
      [UnivDate.calcFinalExamEndDate(new UnivTerm(2024, 1))], // 2024년 1학기 종강일
      [createKstDate('2024-08-01')], // 2024년 여름 방학 중
      [UnivDate.calcSemesterStartDate(new UnivTerm(2024, 2))], // 2024년 2학기 개강일
      [createKstDate('2024-11-01')], // 2024년 2학기 중
      [UnivDate.calcFinalExamEndDate(new UnivTerm(2024, 2))], // 2024년 2학기 종강일
      [createKstDate('2025-02-01')], // 2024년 겨울 방학 중
    ])(
      '4학년 미만이라면 등록일자와 무관하게 `true`를 반환해야 한다',
      (createdAt: Date) => {
        const user = createUser({
          grade: 3,
          createdAt,
        });
        advanceTo(createKstDate('2025-04-01'));

        expect(user.needPayFee()).toEqual(true);
      },
    );
  });

  describe('needPayHalfFee', () => {
    const createUser = (
      params: Partial<{ grade: number; createdAt: Date }> = {},
    ) =>
      DomainFixture.generateUser({
        studentStatus: StudentStatus.UNDERGRADUATE,
        manager: false,
        profile: generateProfile({ grade: params.grade ?? 1 }),
        createdAt: params.createdAt ?? new Date('2025-05-01'),
        returnAt: null,
      });

    test('납부 대상이 아니라면 `false`를 반환해야 한다', () => {
      const user = createUser({
        grade: 4,
        createdAt: createKstDate('2001-01-01'),
      });
      expect(user.needPayHalfFee()).toEqual(false);
    });

    test.each([
      dayjs(UnivDate.calcMidTermExamEndDate(new UnivTerm(2025, 1)))
        .add(1, 'day')
        .toDate(), // 중간고사 종료 기준일 다음날
      createKstDate('2025-05-15'), // 아무튼 중간고사 이후 언젠가
      UnivDate.calcFinalExamEndDate(new UnivTerm(2025, 1)), // 기말고자 종료 기준일
    ])(
      '현재 학기의 중간고사 종료 기준일 이후에 등록했다면 `true`를 반환해야 한다',
      (createdAt: Date) => {
        advanceTo(UnivDate.calcFinalExamEndDate(new UnivTerm(2025, 1)));

        const user = createUser({ grade: 3, createdAt });

        expect(user.needPayHalfFee()).toEqual(true);
      },
    );

    test('중간고사 이후에 등록했다고 해도 현재 학기가 아니라면 `false`를 반환해야 한다', () => {
      advanceTo(createKstDate('2025-10-01'));

      const user = createUser({
        grade: 3,
        createdAt: createKstDate('2025-05-15'),
      });

      // 오늘은 2025년 2학기이고, 등록일은 1학기 중간고사 이후이므로 `false`가 반환되어야 합니다.
      expect(user.needPayHalfFee()).toEqual(false);
    });

    test('중간고사 기간에 등록했다면 `false`를 반환해야 한다', () => {
      advanceTo(UnivDate.calcMidTermExamEndDate(new UnivTerm(2025, 1)));

      const user = createUser({
        grade: 3,
        createdAt: createKstDate('2025-03-15'),
      });

      // 오늘은 2025년 1학기이고, 등록일은 1학기 중간고사 기간이므로 `false`가 반환되어야 합니다.
      expect(user.needPayHalfFee()).toEqual(false);
    });

    test('방학 기간에 등록했다면 `false`를 반환해야 한다', () => {
      advanceTo(createKstDate('2025-08-10'));

      const user = createUser({
        grade: 3,
        createdAt: createKstDate('2025-08-01'),
      });

      expect(user.needPayHalfFee()).toEqual(false);
    });
  });

  describe('graduate', () => {
    test('이미 졸업한 회원이라면 예외를 발생시켜야 한다', () => {
      const user = UserFixture.graduated();

      expect(() => user.graduate()).toThrowError(
        Message.USER_ALREADY_GRADUATED,
      );
    });

    test('회원을 졸업 처리해야 한다', () => {
      const user = UserFixture.undergraduated();

      user.graduate();

      expect(user.studentStatus).toEqual(StudentStatus.GRADUATE);
      expect(user.profile.grade).toEqual(0);
      expect(user.manager).toEqual(false);
      expect(user.updatedAt).toEqual(new Date());
    });
  });

  describe('isGraduated', () => {
    test('졸업한 회원이라면 `true`를 반환해야 한다', () => {
      const user = UserFixture.raw({ studentStatus: StudentStatus.GRADUATE });

      expect(user.isGraduated()).toEqual(true);
    });

    test('졸업하지 않은 회원이라면 `false`를 반환해야 한다', () => {
      const user = UserFixture.raw({
        studentStatus: StudentStatus.UNDERGRADUATE,
      });

      expect(user.isGraduated()).toEqual(false);
    });
  });
});
