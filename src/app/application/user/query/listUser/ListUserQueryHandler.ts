import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  IUserQuery,
  UserQuery,
} from '@sight/app/application/user/query/IUserQuery';
import { ListUserQuery } from '@sight/app/application/user/query/listUser/ListUserQuery';
import { ListUserQueryResult } from '@sight/app/application/user/query/listUser/ListUserQueryResult';

@Injectable()
@QueryHandler(ListUserQuery)
export class ListUserQueryHandler
  implements IQueryHandler<ListUserQuery, ListUserQueryResult>
{
  constructor(
    @Inject(UserQuery)
    private readonly userQuery: IUserQuery,
  ) {}

  async execute(query: ListUserQuery): Promise<ListUserQueryResult> {
    const { state, interestId, limit, offset } = query;

    const listView = await this.userQuery.listUser({
      state,
      interestId,
      limit,
      offset,
    });

    return new ListUserQueryResult(listView);
  }
}
