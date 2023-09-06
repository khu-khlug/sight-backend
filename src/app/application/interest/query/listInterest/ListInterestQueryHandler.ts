import { Injectable, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { IInterestQuery } from '@sight/app/application/interest/query/IInterestQuery';
import { ListInterestQuery } from '@sight/app/application/interest/query/listInterest/ListInterestQuery';
import { ListInterestQueryResult } from '@sight/app/application/interest/query/listInterest/ListInterestQueryResult';

@Injectable()
@QueryHandler(ListInterestQuery)
export class ListInterestQueryHandler
  implements IQueryHandler<ListInterestQuery, ListInterestQueryResult>
{
  constructor(
    @Inject('InterestQuery')
    private readonly interestQuery: IInterestQuery,
  ) {}

  async execute(/* query: ListInterestQuery */): Promise<ListInterestQueryResult> {
    const view = await this.interestQuery.listInterest();
    return new ListInterestQueryResult(view);
  }
}
