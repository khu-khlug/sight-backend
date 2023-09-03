import { IQueryResult } from '@nestjs/cqrs';
import { UserListView } from '@sight/app/application/user/query/view/UserListView';

export class ListUserQueryResult implements IQueryResult {
  constructor(readonly view: UserListView) {}
}
