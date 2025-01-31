export const StudentStatus = {
  UNITED: -1, // 교류
  ABSENCE: 0, // 휴학
  UNDERGRADUATE: 1, // 재학
  GRADUATE: 2, // 졸업
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];
