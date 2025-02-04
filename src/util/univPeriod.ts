import dayjs from 'dayjs';

/**
 * 각 일자 기준에 대한 정의는 회비에 관한 세부 회칙 제8조를 참고해주세요.
 */
export const UnivPeriodType = {
  /** 1학기 개강일 ~ 1학기 중간고사 종료 기준일 */
  FIRST_SEMESTER_IN_MIDTERM_EXAM: 1, //

  /** 1학기 중간고사 종료 기준일의 익일 ~ 1학기 종강일 */
  FIRST_SEMESTER_IN_FINAL_EXAM: 2,

  /** 1학기 종강일의 익일 ~ 1학기 종료일 */
  SUMMER_VACATION: 3,

  /** 2학기 개강일 ~ 2학기 중간고사 종료 기준일 */
  SECOND_SEMESTER_IN_MIDTERM_EXAM: 4,

  /** 2학기 중간고사 종료 기준일의 익일 ~ 2학기 종강일 */
  SECOND_SEMESTER_IN_FINAL_EXAM: 5,

  /** 2학기 종강일의 익일 ~ 2학기 종료일 */
  WINTER_VACATION: 6,
} as const;
export type UnivPeriodType =
  (typeof UnivPeriodType)[keyof typeof UnivPeriodType];

export interface UnivPeriod {
  readonly year: number;
  readonly type: UnivPeriodType;
}

/**
 * @see 회비에 관한 세부 회칙 제8조
 */
export function calcUnivPeriod(refDate: Date): UnivPeriod {
  const dateInKst = dayjs.tz(refDate, 'Asia/Seoul').startOf('day');
  const createKstDate = (dateStr: string) => dayjs.tz(dateStr, 'Asia/Seoul');

  const year = dateInKst.year();

  const firstStart = createKstDate(`${year}-03-01`);
  const firstMidTermEnd = firstStart.add(8, 'week').subtract(1, 'day');
  const firstFinalEnd = firstStart.add(16, 'week').subtract(1, 'day');
  const firstEnd = createKstDate(`${year}-09-01`).subtract(1, 'day');

  const secondStart = createKstDate(`${year}-09-01`);
  const secondMidTermEnd = secondStart.add(8, 'week').subtract(1, 'day');
  const secondFinalEnd = secondStart.add(16, 'week').subtract(1, 'day');

  if (dateInKst.isBefore(firstStart)) {
    return { year: year - 1, type: UnivPeriodType.WINTER_VACATION };
  }

  if (dateInKst.isBetween(firstStart, firstMidTermEnd, 'day', '[]')) {
    return { year, type: UnivPeriodType.FIRST_SEMESTER_IN_MIDTERM_EXAM };
  }

  if (dateInKst.isBetween(firstMidTermEnd, firstFinalEnd, 'day', '[]')) {
    return { year, type: UnivPeriodType.FIRST_SEMESTER_IN_FINAL_EXAM };
  }

  if (dateInKst.isBetween(firstFinalEnd, firstEnd, 'day', '[]')) {
    return { year, type: UnivPeriodType.SUMMER_VACATION };
  }

  if (dateInKst.isBetween(secondStart, secondMidTermEnd, 'day', '[]')) {
    return { year, type: UnivPeriodType.SECOND_SEMESTER_IN_MIDTERM_EXAM };
  }

  if (dateInKst.isBetween(secondMidTermEnd, secondFinalEnd, 'day', '[]')) {
    return { year, type: UnivPeriodType.SECOND_SEMESTER_IN_FINAL_EXAM };
  }

  return { year, type: UnivPeriodType.WINTER_VACATION };
}
