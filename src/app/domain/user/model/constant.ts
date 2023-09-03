export const UserState = {
  UNITED: 'UNITED', // 교류
  ABSENCE: 'ABSENCE', // 휴학
  UNDERGRADUATE: 'UNDERGRADUATE', // 재학
  GRADUATE: 'GRADUATE', // 졸업
} as const;
export type UserState = (typeof UserState)[keyof typeof UserState];
