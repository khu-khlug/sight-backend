import dayjs from 'dayjs';

import { UnivDate } from '@khlug/util/univDate';

/**
 * 각 일자 기준에 대한 정의는 회비에 관한 세부 회칙 제8조를 참고해주세요.
 */
export const UnivPeriodType = {
  /** 1학기 개강일 ~ 1학기 중간고사 종료 기준일 */
  FIRST_SEMESTER_MIDTERM_EXAM: 1, //

  /** 1학기 중간고사 종료 기준일의 익일 ~ 1학기 종강일 */
  FIRST_SEMESTER_FINAL_EXAM: 2,

  /** 1학기 종강일의 익일 ~ 1학기 종료일 */
  SUMMER_VACATION: 3,

  /** 2학기 개강일 ~ 2학기 중간고사 종료 기준일 */
  SECOND_SEMESTER_MIDTERM_EXAM: 4,

  /** 2학기 중간고사 종료 기준일의 익일 ~ 2학기 종강일 */
  SECOND_SEMESTER_FINAL_EXAM: 5,

  /** 2학기 종강일의 익일 ~ 2학기 종료일 */
  WINTER_VACATION: 6,
} as const;
export type UnivPeriodType =
  (typeof UnivPeriodType)[keyof typeof UnivPeriodType];

export class UnivPeriod {
  readonly year: number;
  readonly type: UnivPeriodType;

  constructor(year: number, type: UnivPeriodType) {
    this.year = year;
    this.type = type;
  }

  inVacation(): boolean {
    return (
      this.type === UnivPeriodType.SUMMER_VACATION ||
      this.type === UnivPeriodType.WINTER_VACATION
    );
  }

  /**
   * @see 회비에 관한 세부 회칙 제8조
   */
  static fromDate(refDate: Date): UnivPeriod {
    const dateInKst = dayjs.tz(refDate, 'Asia/Seoul').startOf('day');

    const year = dateInKst.year();

    const firstStart = UnivDate.calcSemesterStartDate(year, 1);
    const firstMidTermEnd = UnivDate.calcMidTermExamEndDate(year, 1);
    const firstFinalEnd = UnivDate.calcFinalExamEndDate(year, 1);
    const firstEnd = UnivDate.calcSemesterEndDate(year, 1);

    const secondStart = UnivDate.calcSemesterStartDate(year, 2);
    const secondMidTermEnd = UnivDate.calcMidTermExamEndDate(year, 2);
    const secondFinalEnd = UnivDate.calcFinalExamEndDate(year, 2);

    if (dateInKst.isBefore(firstStart)) {
      return new UnivPeriod(year - 1, UnivPeriodType.WINTER_VACATION);
    }

    if (dateInKst.isBetween(firstStart, firstMidTermEnd, 'day', '[]')) {
      return new UnivPeriod(year, UnivPeriodType.FIRST_SEMESTER_MIDTERM_EXAM);
    }

    if (dateInKst.isBetween(firstMidTermEnd, firstFinalEnd, 'day', '[]')) {
      return new UnivPeriod(year, UnivPeriodType.FIRST_SEMESTER_FINAL_EXAM);
    }

    if (dateInKst.isBetween(firstFinalEnd, firstEnd, 'day', '[]')) {
      return new UnivPeriod(year, UnivPeriodType.SUMMER_VACATION);
    }

    if (dateInKst.isBetween(secondStart, secondMidTermEnd, 'day', '[]')) {
      return new UnivPeriod(year, UnivPeriodType.SECOND_SEMESTER_MIDTERM_EXAM);
    }

    if (dateInKst.isBetween(secondMidTermEnd, secondFinalEnd, 'day', '[]')) {
      return new UnivPeriod(year, UnivPeriodType.SECOND_SEMESTER_FINAL_EXAM);
    }

    return new UnivPeriod(year, UnivPeriodType.WINTER_VACATION);
  }
}
