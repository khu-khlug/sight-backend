import { IQueryResult } from '@nestjs/cqrs';

import { UserWithTagListView } from '@khlug/app/application/user/query/view/UserListView';

export class ListUserQueryResult implements IQueryResult {
  constructor(readonly view: UserWithTagListView) {}
}
