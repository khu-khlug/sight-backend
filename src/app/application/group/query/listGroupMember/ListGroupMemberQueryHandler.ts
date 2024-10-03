import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GroupQuery,
  IGroupQuery,
} from '@khlug/app/application/group/query/IGroupQuery';
import { ListGroupMemberQuery } from '@khlug/app/application/group/query/listGroupMember/ListGroupMemberQuery';
import { ListGroupMemberQueryResult } from '@khlug/app/application/group/query/listGroupMember/ListGroupMemberQueryResult';

@QueryHandler(ListGroupMemberQuery)
export class ListGroupMemberQueryHandler
  implements IQueryHandler<ListGroupMemberQuery, ListGroupMemberQueryResult>
{
  constructor(
    @Inject(GroupQuery)
    private readonly groupQuery: IGroupQuery,
  ) {}

  async execute(
    query: ListGroupMemberQuery,
  ): Promise<ListGroupMemberQueryResult> {
    const { groupId, limit, offset } = query;

    const listView = await this.groupQuery.listGroupMember({
      groupId,
      limit,
      offset,
    });

    return new ListGroupMemberQueryResult(listView);
  }
}
