import dayjs from 'dayjs';

import { UnivDate } from '@khlug/util/univDate';
import { UnivTerm } from '@khlug/util/univTerm';

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

  toTerm(): UnivTerm {
    switch (this.type) {
      case UnivPeriodType.FIRST_SEMESTER_MIDTERM_EXAM:
      case UnivPeriodType.FIRST_SEMESTER_FINAL_EXAM:
      case UnivPeriodType.SUMMER_VACATION:
        return new UnivTerm(this.year, 1);
      case UnivPeriodType.SECOND_SEMESTER_MIDTERM_EXAM:
      case UnivPeriodType.SECOND_SEMESTER_FINAL_EXAM:
      case UnivPeriodType.WINTER_VACATION:
        return new UnivTerm(this.year, 2);
    }
  }

  /**
   * @see 회비에 관한 세부 회칙 제8조
   */
  static fromDate(refDate: Date): UnivPeriod {
    const dateInKst = dayjs.tz(refDate, 'Asia/Seoul').startOf('day');

    const year = dateInKst.year();

    const firstTerm = new UnivTerm(year, 1);
    const firstStart = UnivDate.calcSemesterStartDate(firstTerm);
    const firstMidTermEnd = UnivDate.calcMidTermExamEndDate(firstTerm);
    const firstFinalEnd = UnivDate.calcFinalExamEndDate(firstTerm);
    const firstEnd = UnivDate.calcSemesterEndDate(firstTerm);

    const secondTerm = new UnivTerm(year, 2);
    const secondStart = UnivDate.calcSemesterStartDate(secondTerm);
    const secondMidTermEnd = UnivDate.calcMidTermExamEndDate(secondTerm);
    const secondFinalEnd = UnivDate.calcFinalExamEndDate(secondTerm);

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
