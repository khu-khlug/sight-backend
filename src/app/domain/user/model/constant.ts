export const UserState = {
  UNITED: 'UNITED', // 교류, 구 -1
  ABSENCE: 'ABSENCE', // 휴학, 구 0
  UNDERGRADUATE: 'UNDERGRADUATE', // 재학, 구 1
  GRADUATE: 'GRADUATE', // 졸업, 구 2
} as const;
export type UserState = (typeof UserState)[keyof typeof UserState];
