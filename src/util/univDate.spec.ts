import dayjs from 'dayjs';

import { UnivDate } from '@khlug/util/univDate';
import { UnivTerm } from '@khlug/util/univTerm';

describe('UnivDate', () => {
  describe('calcSemesterStartDate', () => {
    test('1학기라면 3월 1일을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 1);
      const result = UnivDate.calcSemesterStartDate(term);

      expect(result).toEqual(dayjs.tz('2025-03-01', 'Asia/Seoul').toDate());
    });

    test('2학기라면 9월 1일을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 2);
      const result = UnivDate.calcSemesterStartDate(term);

      expect(result).toEqual(dayjs.tz('2025-09-01', 'Asia/Seoul').toDate());
    });
  });

  describe('calcMidTermExamEndDate', () => {
    test('1학기라면 3월 1일로부터 8주 후의 전날을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 1);
      const result = UnivDate.calcMidTermExamEndDate(term);

      // o--------------------o   o--------------------o
      // |      2025-03       |   |      2025-04       |
      // |--------------------|   |--------------------|
      // |  |  |  |  |  |  | 1|   |  |  | 1| 2| 3| 4| 5|
      // | 2| 3| 4| 5| 6| 7| 8|   | 6| 7| 8| 9|10|11|12|
      // | 9|10|11|12|13|14|15|   |13|14|15|16|17|18|19|
      // |16|17|18|19|20|21|22|   |20|21|22|23|24|25|26|
      // |23|24|25|26|27|28|29|   |27|28|29|30|  |  |  |
      // |30|31|  |  |  |  |  |   o--------------------o
      // o--------------------o
      // 3월 1일은 일요일이고, 8주 후는 4월 26일이므로, 반환값은 4월 25일이어야 합니다.
      expect(result).toEqual(dayjs.tz('2025-04-25', 'Asia/Seoul').toDate());
    });

    test('2학기라면 9월 1일로부터 8주 후의 전날을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 2);
      const result = UnivDate.calcMidTermExamEndDate(term);

      // o--------------------o   o--------------------o
      // |      2025-09       |   |      2025-10       |
      // |--------------------|   |--------------------|
      // |  | 1| 2| 3| 4| 5| 6|   |  |  |  | 1| 2| 3| 4|
      // | 7| 8| 9|10|11|12|13|   | 5| 6| 7| 8| 9|10|11|
      // |14|15|16|17|18|19|20|   |12|13|14|15|16|17|18|
      // |21|22|23|24|25|26|27|   |19|20|21|22|23|24|25|
      // |28|29|30|  |  |  |  |   |26|27|28|29|30|  |  |
      // o--------------------o   o--------------------o
      // 9월 1일은 월요일이고, 8주 후는 10월 27일이므로, 반환값은 10월 26일이어야 합니다.
      expect(result).toEqual(dayjs.tz('2025-10-26', 'Asia/Seoul').toDate());
    });
  });

  describe('calcFinalExamEndDate', () => {
    test('1학기라면 3월 1일로부터 16주 후의 전날을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 1);
      const result = UnivDate.calcFinalExamEndDate(term);

      // o--------------------o   o--------------------o
      // |      2025-03       |   |      2025-06       |
      // |--------------------|   |--------------------|
      // |  |  |  |  |  |  | 1|   | 1| 2| 3| 4| 5| 6| 7|
      // | 2| 3| 4| 5| 6| 7| 8|   | 8| 9|10|11|12|13|14|
      // | 9|10|11|12|13|14|15|   |15|16|17|18|19|20|21|
      // |16|17|18|19|20|21|22|   |22|23|24|25|26|27|28|
      // |23|24|25|26|27|28|29|   |29|30|  |  |  |  |  |
      // |30|31|  |  |  |  |  |   o--------------------o
      // o--------------------o
      // 3월 1일은 일요일이고, 16주 후는 6월 21일이므로, 반환값은 6월 20일이어야 합니다.
      expect(result).toEqual(dayjs.tz('2025-06-20', 'Asia/Seoul').toDate());
    });

    test('2학기라면 9월 1일로부터 16주 후의 전날을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 2);
      const result = UnivDate.calcFinalExamEndDate(term);

      // o--------------------o   o--------------------o
      // |      2025-09       |   |      2025-12       |
      // |--------------------|   |--------------------|
      // |  | 1| 2| 3| 4| 5| 6|   |  | 1| 2| 3| 4| 5| 6|
      // | 7| 8| 9|10|11|12|13|   | 7| 8| 9|10|11|12|13|
      // |14|15|16|17|18|19|20|   |14|15|16|17|18|19|20|
      // |21|22|23|24|25|26|27|   |21|22|23|24|25|26|27|
      // |28|29|30|  |  |  |  |   |28|29|30|31|  |  |  |
      // o--------------------o   o--------------------o
      // 9월 1일은 월요일이고, 16주 후는 12월 22일이므로, 반환값은 12월 21일이어야 합니다.
      expect(result).toEqual(dayjs.tz('2025-12-21', 'Asia/Seoul').toDate());
    });
  });

  describe('calcSemesterEndDate', () => {
    test('1학기라면 2학기 개강일의 전날을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 1);
      const result = UnivDate.calcSemesterEndDate(term);

      expect(result).toEqual(dayjs.tz('2025-08-31', 'Asia/Seoul').toDate());
    });

    test('2학기라면 내년 1학기 개강일의 전날을 반환해야 한다', () => {
      const term = new UnivTerm(2025, 2);
      const result = UnivDate.calcSemesterEndDate(term);

      expect(result).toEqual(dayjs.tz('2026-02-28', 'Asia/Seoul').toDate());
    });

    test('2학기인데 내년이 윤년이라면 29일을 반환해야 한다', () => {
      const term = new UnivTerm(2027, 2);
      const result = UnivDate.calcSemesterEndDate(term);

      expect(result).toEqual(dayjs.tz('2028-02-29', 'Asia/Seoul').toDate());
    });
  });
});
