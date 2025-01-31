export const StudentStatus = {
  UNITED: -1, // 교류
  ABSENCE: 0, // 휴학
  UNDERGRADUATE: 1, // 재학
  GRADUATE: 2, // 졸업
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const UserStatus = {
  INACTIVE: -1, // 정지
  UNAUTHORIZED: 0, // 미승인 혹은 탈퇴
  ACTIVE: 1, // 활성
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];
