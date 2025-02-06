import dayjs from 'dayjs';

export class UnivDate {
  /**
   * 주어진 연도 학기의 개강일을 계산합니다.
   */
  static calcSemesterStartDate(year: number, semester: 1 | 2): Date {
    if (semester === 1) {
      return dayjs.tz(`${year}-03-01`, 'Asia/Seoul').toDate();
    } else {
      return dayjs.tz(`${year}-09-01`, 'Asia/Seoul').toDate();
    }
  }

  /**
   * 주어진 연도 학기의 중간고사 완료 기준일을 계산합니다.
   */
  static calcMidTermExamEndDate(year: number, semester: 1 | 2): Date {
    if (semester === 1) {
      return dayjs
        .tz(`${year}-03-01`, 'Asia/Seoul')
        .add(8, 'week')
        .subtract(1, 'day')
        .toDate();
    } else {
      return dayjs
        .tz(`${year}-09-01`, 'Asia/Seoul')
        .add(8, 'week')
        .subtract(1, 'day')
        .toDate();
    }
  }

  /**
   * 주어진 연도 학기의 기말고사 완료 기준일(=종강일)을 계산합니다.
   */
  static calcFinalExamEndDate(year: number, semester: 1 | 2): Date {
    if (semester === 1) {
      return dayjs
        .tz(`${year}-03-01`, 'Asia/Seoul')
        .add(16, 'week')
        .subtract(1, 'day')
        .toDate();
    } else {
      return dayjs
        .tz(`${year}-09-01`, 'Asia/Seoul')
        .add(16, 'week')
        .subtract(1, 'day')
        .toDate();
    }
  }

  /**
   * 주어진 연도 학기의 학기 종료일을 계산합니다.
   */
  static calcSemesterEndDate(year: number, semester: 1 | 2): Date {
    if (semester === 1) {
      return dayjs
        .tz(`${year}-09-01`, 'Asia/Seoul')
        .subtract(1, 'day')
        .toDate();
    } else {
      return dayjs
        .tz(`${year + 1}-03-01`, 'Asia/Seoul')
        .subtract(1, 'day')
        .toDate();
    }
  }
}
