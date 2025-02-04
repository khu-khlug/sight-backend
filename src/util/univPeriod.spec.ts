import dayjs from 'dayjs';

import { calcUnivPeriod, UnivPeriodType } from '@khlug/util/univPeriod';

describe('semester', () => {
  describe('calcUnivPeriod', () => {
    const createKstDate = (dateStr: string) =>
      dayjs.tz(dateStr, 'Asia/Seoul').startOf('day');

    test('1학기가 시작하지 않았다면 전년도 겨울방학 기간을 반환해야 한다', () => {
      const date = createKstDate('2025-02-28').toDate();
      const result = calcUnivPeriod(date);

      expect(result).toEqual({
        year: 2024,
        type: UnivPeriodType.WINTER_VACATION,
      });
    });

    test('1학기가 시작하지 않았다면 전년도 겨울방학 기간을 반환해야 한다 (윤년)', () => {
      const date = createKstDate('2024-02-29').toDate();
      const result = calcUnivPeriod(date);

      expect(result).toEqual({
        year: 2023,
        type: UnivPeriodType.WINTER_VACATION,
      });
    });

    test.each([
      createKstDate('2025-03-01').toDate(),
      createKstDate('2025-03-01').add(4, 'week').toDate(),
      createKstDate('2025-03-01').add(8, 'week').subtract(1, 'day').toDate(),
    ])(
      '1학기 개강일과 1학기 중간고사 종료 기준일 사이라면 1학기 중간고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(calcUnivPeriod(date)).toEqual({
          year: 2025,
          type: UnivPeriodType.FIRST_SEMESTER_IN_MIDTERM_EXAM,
        });
      },
    );

    test.each([
      createKstDate('2025-03-01').add(8, 'week').toDate(),
      createKstDate('2025-03-01').add(12, 'week').toDate(),
      createKstDate('2025-03-01').add(16, 'week').subtract(1, 'day').toDate(),
    ])(
      '1학기 중간고사 종료 기준일의 익일과 1학기 종강일 사이라면 1학기 기말고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(calcUnivPeriod(date)).toEqual({
          year: 2025,
          type: UnivPeriodType.FIRST_SEMESTER_IN_FINAL_EXAM,
        });
      },
    );

    test.each([
      createKstDate('2025-03-01').add(16, 'week').toDate(),
      createKstDate('2025-03-01').add(20, 'week').toDate(),
      createKstDate('2025-09-01').subtract(1, 'day').toDate(),
    ])(
      '1학기 종강일의 익일과 1학기 종료일 사이라면 여름 방학 기간을 반환해야 한다',
      (date: Date) => {
        expect(calcUnivPeriod(date)).toEqual({
          year: 2025,
          type: UnivPeriodType.SUMMER_VACATION,
        });
      },
    );

    test.each([
      createKstDate('2025-09-01').toDate(),
      createKstDate('2025-09-01').add(4, 'week').toDate(),
      createKstDate('2025-09-01').add(8, 'week').subtract(1, 'day').toDate(),
    ])(
      '2학기 개강일과 2학기 중간고사 종료 기준일 사이라면 2학기 중간고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(calcUnivPeriod(date)).toEqual({
          year: 2025,
          type: UnivPeriodType.SECOND_SEMESTER_IN_MIDTERM_EXAM,
        });
      },
    );

    test.each([
      createKstDate('2025-09-01').add(8, 'week').toDate(),
      createKstDate('2025-09-01').add(12, 'week').toDate(),
      createKstDate('2025-09-01').add(16, 'week').subtract(1, 'day').toDate(),
    ])(
      '2학기 중간고사 종료 기준일의 익일과 2학기 종강일 사이라면 2학기 기말고사 기간을 반환해야 한다',
      (date: Date) => {
        expect(calcUnivPeriod(date)).toEqual({
          year: 2025,
          type: UnivPeriodType.SECOND_SEMESTER_IN_FINAL_EXAM,
        });
      },
    );

    test.each([
      createKstDate('2025-09-01').add(16, 'week').toDate(),
      createKstDate('2025-09-01').add(20, 'week').toDate(),
      createKstDate('2025-12-31').toDate(),
    ])(
      '2학기 종강일의 익일과 연의 말일 사이라면 겨울 방학 기간을 반환해야 한다',
      (date: Date) => {
        expect(calcUnivPeriod(date)).toEqual({
          year: 2025,
          type: UnivPeriodType.WINTER_VACATION,
        });
      },
    );
  });
});
