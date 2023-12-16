export const CUSTOMER_SERVICE_GROUP_ID = '15265';
export const PRACTICE_GROUP_ID = '7549';

export const GroupCategory = {
  STUDY: 'STUDY',
  PROJECT: 'PROJECT',
  MANAGE: 'MANAGE',
  DOCUMENTATION: 'DOCUMENTATION',
  PROGRAM: 'PROGRAM',
  EDUCATION: 'EDUCATION',
} as const;
export type GroupCategory = (typeof GroupCategory)[keyof typeof GroupCategory];

export const ManagerOnlyGroupCategory: GroupCategory[] = [
  GroupCategory.MANAGE,
  GroupCategory.EDUCATION,
  GroupCategory.PROGRAM,
];

export const GroupState = {
  PENDING: 'PENDING',
  PROGRESS: 'PROGRESS',
  SUSPEND: 'SUSPEND',
  END_SUCCESS: 'END_SUCCESS',
  END_FAIL: 'END_FAIL',
} as const;
export type GroupState = (typeof GroupState)[keyof typeof GroupState];

export const GroupCardState = {
  PUBLIC: 'PUBLIC',
  DEACTIVATE: 'DEACTIVATE',
  ARCHIVE: 'ARCHIVE',
} as const;
export type GroupCardState =
  (typeof GroupCardState)[keyof typeof GroupCardState];

export const GroupRecordState = {
  PUBLIC: 'PUBLIC',
  ARCHIVE: 'ARCHIVE',
} as const;
export type GroupRecordState =
  (typeof GroupRecordState)[keyof typeof GroupRecordState];

export const GroupAccessGrade = {
  PRIVATE: 'PRIVATE', // 비공개
  MANAGER: 'MANAGER', // 운영진 공개
  MEMBER: 'MEMBER', // 쿠러그 멤버 공개
  ALL: 'ALL', // 전체 공개
};
export type GroupAccessGrade =
  (typeof GroupAccessGrade)[keyof typeof GroupAccessGrade];

export const ManagerOnlyGroupAccessGrade: GroupAccessGrade[] = [
  GroupAccessGrade.MANAGER,
];
