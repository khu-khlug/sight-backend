import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ListUserQuery } from '@sight/app/application/user/query/listUser/ListUserQuery';
import { ListUserQueryResult } from '@sight/app/application/user/query/listUser/ListUserQueryResult';
import { IUserQuery } from '@sight/app/application/user/query/IUserQuery';

@Injectable()
@QueryHandler(ListUserQuery)
export class ListUserQueryHandler
  implements IQueryHandler<ListUserQuery, ListUserQueryResult>
{
  constructor(
    @Inject('UserQuery')
    private readonly userQuery: IUserQuery,
  ) {}

  async execute(query: ListUserQuery): Promise<ListUserQueryResult> {
    const { state, limit, offset } = query;

    const listView = await this.userQuery.listUser({
      state,
      limit,
      offset,
    });

    return new ListUserQueryResult(listView);
  }
}
