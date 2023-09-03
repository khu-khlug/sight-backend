import { UserListView } from '@sight/app/application/user/query/view/UserListView';
import { UserState } from '@sight/app/domain/user/model/constant';

export type ListUserParams = {
  state: UserState | null;
  limit: number;
  offset: number;
};

export interface IUserQuery {
  listUser: (params: ListUserParams) => Promise<UserListView>;
}
