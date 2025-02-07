import dayjs from 'dayjs';

import { UnivPeriod, UnivPeriodType } from '@khlug/util/univPeriod';
import { UnivTerm } from '@khlug/util/univTerm';

describe('UnivPeriod', () => {
  const createKstDate = (dateStr: string) =>
    dayjs.tz(dateStr, 'Asia/Seoul').startOf('day');

  describe('inVacation', () => {
    test.each([
      UnivPeriodType.FIRST_SEMESTER_MIDTERM_EXAM,
      UnivPeriodType.FIRST_SEMESTER_FINAL_EXAM,
      UnivPeriodType.SECOND_SEMESTER_MIDTERM_EXAM,
      UnivPeriodType.SECOND_SEMESTER_FINAL_EXAM,
    ])('학기 중이라면 `false`를 반환해야 한다', (type) => {
      const period = new UnivPeriod(2025, type);
      expect(period.inVacation()).toBe(false);
    });

    test.each([UnivPeriodType.SUMMER_VACATION, UnivPeriodType.WINTER_VACATION])(
      '방학 중이라면 `true`를 반환해야 한다',
      (type) => {
        const period = new UnivPeriod(2025, type);
        expect(period.inVacation()).toBe(true);
      },
    );
  });

  describe('toTerm', () => {
    test.each([
      UnivPeriodType.FIRST_SEMESTER_MIDTERM_EXAM,
      UnivPeriodType.FIRST_SEMESTER_FINAL_EXAM,
      UnivPeriodType.SUMMER_VACATION,
    ])(`1학기 기간이라면 1학기를 반환해야 한다`, (type) => {
      const period = new UnivPeriod(2025, type);
      expect(period.toTerm()).toEqual(new UnivTerm(2025, 1));
    });

    test.each([
      UnivPeriodType.SECOND_SEMESTER_MIDTERM_EXAM,
      UnivPeriodType.SECOND_SEMESTER_FINAL_EXAM,
      UnivPeriodType.WINTER_VACATION,
    ])(`2학기 기간이라면 2학기를 반환해야 한다`, (type) => {
      const period = new UnivPeriod(2025, type);
      expect(period.toTerm()).toEqual(new UnivTerm(2025, 2));
    });
  });

  describe('fromDate', () => {
    test('1학기가 시작하지 않았다면 전년도 겨울방학 기간을 반환해야 한다', () => {
      const date = createKstDate('2025-02-28').toDate();
      const result = UnivPeriod.fromDate(date);

      expect(result).toEqual(
        new UnivPeriod(2024, UnivPeriodType.WINTER_VACATION),
      );
    });

    test('1학기가 시작하지 않았다면 전년도 겨울방학 기간을 반환해야 한다 (윤년)', () => {
      const date = createKstDate('2024-02-29').toDate();
      const result = UnivPeriod.fromDate(date);

      expect(result).toEqual(
        new UnivPeriod(2023, UnivPeriodType.WINTER_VACATION),
      );
    });

    test.each([
      createKstDate('2025-03-01').toDate(),
      createKstDate('2025-03-01').add(4, 'week').toDate(),
      createKstDate('2025-03-01').add(8, 'week').subtract(1, 'day').toDate(),
    ])(
      '1학기 개강일과 1학기 중간고사 종료 기준일 사이라면 1학기 중간고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(UnivPeriod.fromDate(date)).toEqual(
          new UnivPeriod(2025, UnivPeriodType.FIRST_SEMESTER_MIDTERM_EXAM),
        );
      },
    );

    test.each([
      createKstDate('2025-03-01').add(8, 'week').toDate(),
      createKstDate('2025-03-01').add(12, 'week').toDate(),
      createKstDate('2025-03-01').add(16, 'week').subtract(1, 'day').toDate(),
    ])(
      '1학기 중간고사 종료 기준일의 익일과 1학기 종강일 사이라면 1학기 기말고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(UnivPeriod.fromDate(date)).toEqual(
          new UnivPeriod(2025, UnivPeriodType.FIRST_SEMESTER_FINAL_EXAM),
        );
      },
    );

    test.each([
      createKstDate('2025-03-01').add(16, 'week').toDate(),
      createKstDate('2025-03-01').add(20, 'week').toDate(),
      createKstDate('2025-09-01').subtract(1, 'day').toDate(),
    ])(
      '1학기 종강일의 익일과 1학기 종료일 사이라면 여름 방학 기간을 반환해야 한다',
      (date: Date) => {
        expect(UnivPeriod.fromDate(date)).toEqual(
          new UnivPeriod(2025, UnivPeriodType.SUMMER_VACATION),
        );
      },
    );

    test.each([
      createKstDate('2025-09-01').toDate(),
      createKstDate('2025-09-01').add(4, 'week').toDate(),
      createKstDate('2025-09-01').add(8, 'week').subtract(1, 'day').toDate(),
    ])(
      '2학기 개강일과 2학기 중간고사 종료 기준일 사이라면 2학기 중간고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(UnivPeriod.fromDate(date)).toEqual(
          new UnivPeriod(2025, UnivPeriodType.SECOND_SEMESTER_MIDTERM_EXAM),
        );
      },
    );

    test.each([
      createKstDate('2025-09-01').add(8, 'week').toDate(),
      createKstDate('2025-09-01').add(12, 'week').toDate(),
      createKstDate('2025-09-01').add(16, 'week').subtract(1, 'day').toDate(),
    ])(
      '2학기 중간고사 종료 기준일의 익일과 2학기 종강일 사이라면 2학기 기말고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(UnivPeriod.fromDate(date)).toEqual(
          new UnivPeriod(2025, UnivPeriodType.SECOND_SEMESTER_FINAL_EXAM),
        );
      },
    );

    test.each([
      createKstDate('2025-09-01').add(16, 'week').toDate(),
      createKstDate('2025-09-01').add(20, 'week').toDate(),
      createKstDate('2025-12-31').toDate(),
    ])(
      '2학기 종강일의 익일과 연의 말일 사이라면 겨울 방학 기간을 반환해야 한다',
      (date: Date) => {
        expect(UnivPeriod.fromDate(date)).toEqual(
          new UnivPeriod(2025, UnivPeriodType.WINTER_VACATION),
        );
      },
    );
  });
});
