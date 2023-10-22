export const SeminarState = {
  CREATED: 'CREATED', // 구 0
  REGISTRATION_OPENED: 'REGISTRATION_OPENED', // 접수 중, 구 1
  REGISTRATION_CLOSED: 'REGISTRATION_CLOSED', // 접수 마감, 구 2
} as const;
export type SeminarState = (typeof SeminarState)[keyof typeof SeminarState];

export const SeminarSemester = {
  FIRST: 'FIRST', // 1학기
  SUMMER: 'SUMMER', // 여름 계절학기
  SECOND: 'SECOND', // 2학기
  WINTER: 'WINTER', // 겨울 계절학기
} as const;
export type SeminarSemester =
  (typeof SeminarSemester)[keyof typeof SeminarSemester];
