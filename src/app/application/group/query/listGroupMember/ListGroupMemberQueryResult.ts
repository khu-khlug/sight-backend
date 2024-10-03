import { IQueryResult } from '@nestjs/cqrs';

import { GroupMemberListView } from '@khlug/app/application/group/query/view/GroupMemberListView';

export class ListGroupMemberQueryResult implements IQueryResult {
  constructor(readonly listView: GroupMemberListView) {}
}
