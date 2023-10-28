import { UserListView } from '@sight/app/application/user/query/view/UserListView';

import { UserState } from '@sight/app/domain/user/model/constant';

export type ListUserParams = {
  state: UserState | null;
  interestId: string | null;
  limit: number;
  offset: number;
};

export const UserQuery = Symbol('UserQuery');

export interface IUserQuery {
  listUser: (params: ListUserParams) => Promise<UserListView>;
}
