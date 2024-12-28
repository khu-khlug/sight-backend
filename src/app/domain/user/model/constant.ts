export const UserState = {
  UNITED: -1, // 교류
  ABSENCE: 0, // 휴학
  UNDERGRADUATE: 1, // 재학
  GRADUATE: 2, // 졸업
} as const;
export type UserState = (typeof UserState)[keyof typeof UserState];
