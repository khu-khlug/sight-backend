export const GroupCategory = {
  STUDY: 'STUDY',
  PROJECT: 'PROJECT',
  MANAGE: 'MANAGE',
  DOCUMENTATION: 'DOCUMENTATION',
  PROGRAM: 'PROGRAM',
  EDUCATION: 'EDUCATION',
} as const;
export type GroupCategory = (typeof GroupCategory)[keyof typeof GroupCategory];

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
