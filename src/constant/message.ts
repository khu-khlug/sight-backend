export const Message = {
  // 401 Unauthorized
  TOKEN_REQUIRED: 'Token is required',

  // 403 Forbidden
  CANNOT_CREATE_GROUP: 'Cannot create group',
  CANNOT_MODIFY_GROUP: 'Cannot modify group',
  ONLY_GROUP_ADMIN_CAN_EDIT_GROUP: 'Only group admin can edit the group',
  ONLY_MANAGER_CAN_SUSPEND_GROUP: 'Only managers can suspend the group',
  REQUESTER_NOT_JOINED_GROUP: 'Requester is not joined the group',

  // 404 Not Found
  USER_NOT_FOUND: 'User not found',
  SOME_INTERESTS_NOT_FOUND: 'Some interests not found',
  GROUP_NOT_FOUND: 'Group not found',
  SOME_DOOR_LOCK_PASSWORD_NOT_FOUND: '일부 도어락 비밀번호가 존재하지 않습니다',

  // 422 Unprocessable Entity
  GRADUATED_USER_ONLY_CAN_CHANGE_EMAIL: 'Graduated user only can change email',
  UNITED_USER_CAN_ONLY_CHANGE_EMAIL: 'United user can only change email',
  GROUP_NOT_EDITABLE: 'Group is not editable',
  CANNOT_MODIFY_CUSTOMER_SERVICE_GROUP: 'Cannot modify customer service group',
  ALREADY_GROUP_ENABLED_PORTFOLIO: 'Already group enabled portfolio',
  ALREADY_GROUP_DISABLED_PORTFOLIO: 'Already group disabled portfolio',
  DEFAULT_BOOKMARKED_GROUP: 'Cannot add bookmark default bookmarked group',
};
