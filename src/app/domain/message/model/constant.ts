export const SlackMessageCategory = {
  MY_ACTIVITY: 'MY_ACTIVITY', // 게시판 및 일정 관련 내가 한 활동, 구 11
  OTHERS_ACTIVITY_FOR_MINE: 'OTHERS_ACTIVITY_FOR_MINE', // 내 게시판 글에 대한 타인의 활동, 구 12

  GROUP_ACTIVITY: 'GROUP_ACTIVITY', // 내 그룹에 관한 활동, 구 21
  GROUP_CARD_ACTIVITY: 'GROUP_CARD_ACTIVITY', // 내 그룹의 카드에 관한 활동, 구 22
  GROUP_RECORD_ACTIVITY: 'GROUP_RECORD_ACTIVITY', // 내 그룹의 기록에 관한 활동, 구 23
  GROUP_SCHEDULE: 'GROUP_SCHEDULE', // 내 그룹의 일정에 관한 활동, 구 24
  GROUP_ACTIVITY_FOR_ME: 'GROUP_ACTIVITY_FOR_ME', // 나에게만 알려지는 그룹 활동, 구 25
  GROUP_ACTIVITY_AS_ADMIN: 'GROUP_ACTIVITY_AS_ADMIN', // 그룹장으로서 받는 활동, 구 26

  SUPPORT_REQUEST: 'SUPPORT_REQUEST', // 지원 신청과 관련된 알림, 구 31
  LAB: 'LAB', // 연구실과 관련된 알림, 구 32

  USER_DATA: 'USER_DATA', // 내 정보에 관한 활동, 구 41
  EXPERIENCE: 'EXPERIENCE', // 경험치에 관한 활동, 구 42

  ETC_MY_ACTIVITY: 'ETC_MY_ACTIVITY', // 기타 내가 한 활동(로고 등록 등), 구 81
  OTHERS_ACTIVITY_AFFECT_MY_ACTIVITY: 'OTHERS_ACTIVITY_AFFECT_MY_ACTIVITY', // 내 활동에 영향이 있는 타인의 활동(내 아이디어로 그룹이 만들어짐 등), 구 82
  ALL_USERS: 'ALL_USERS', //모든 회원이 받는 알림, 구 83
  MY_ACTIVITY_ON_OFFLINE: 'MY_ACTIVITY_ON_OFFLINE', // 오프라인에서 내가 한 활동, 구 84

  NOTICE: 'NOTICE', // 통보하는 알림, 구 91
  IMPORTANT_NOTICE: 'IMPORTANT_NOTICE', // 확인이 필요한 중요한 알림, 구 92
} as const;
export type SlackMessageCategory =
  (typeof SlackMessageCategory)[keyof typeof SlackMessageCategory];
