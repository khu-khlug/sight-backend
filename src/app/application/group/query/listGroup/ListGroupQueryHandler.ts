import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  GroupQuery,
  IGroupQuery,
} from '@sight/app/application/group/query/IGroupQuery';
import { ListGroupQuery } from '@sight/app/application/group/query/listGroup/ListGroupQuery';
import { ListGroupQueryResult } from '@sight/app/application/group/query/listGroup/ListGroupQueryResult';

@QueryHandler(ListGroupQuery)
export class ListGroupQueryHandler
  implements IQueryHandler<ListGroupQuery, ListGroupQueryResult>
{
  constructor(
    @Inject(GroupQuery)
    private readonly groupQuery: IGroupQuery,
  ) {}

  async execute(query: ListGroupQuery): Promise<ListGroupQueryResult> {
    const { queryType, keyword, limit, offset } = query;

    const listView = await this.groupQuery.listGroup({
      queryType,
      keyword,
      limit,
      offset,
    });

    return new ListGroupQueryResult(listView);
  }
}
