import { IQueryResult } from '@nestjs/cqrs';

import { GroupListView } from '@khlug/app/application/group/query/view/GroupListView';

export class ListGroupQueryResult implements IQueryResult {
  constructor(readonly listView: GroupListView) {}
}
