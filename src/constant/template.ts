export const Template = {
  DISABLE_GROUP_PORTFOLIO: {
    notification:
      '<a href="/group/:groupId:"><u>:groupTitle:</u></a> 그룹의 포트폴리오 발행이 중단되었습니다.',
    point: '<u>:groupTitle:</u> 그룹의 포트폴리오가 발행되었습니다.',
  },
  ADD_GROUP_BOOKMARK: {
    notification:
      '<a href="/group/:groupId:"><u>:groupTitle:</u></a> 그룹을 즐겨 찾습니다.',
  },
  REMOVE_GROUP_BOOKMARK: {
    notification:
      '<a href="/group/:groupId:"><u>:groupTitle:</u></a> 그룹을 더 이상 즐겨 찾지 않습니다.',
  },
} as const;
