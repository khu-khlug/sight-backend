import { UserView } from '@sight/app/application/user/query/view/UserView';

export interface UserListView {
  count: number;
  users: UserView[];
}
