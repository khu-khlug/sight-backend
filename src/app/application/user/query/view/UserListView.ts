import {
  UserView,
  UserWithTagView,
} from '@khlug/app/application/user/query/view/UserView';

export interface UserListView {
  count: number;
  users: UserView[];
}

export interface UserWithTagListView {
  count: number;
  users: UserWithTagView[];
}
