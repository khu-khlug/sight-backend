import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  IInterestQuery,
  InterestQuery,
} from '@khlug/app/application/interest/query/IInterestQuery';
import { ListInterestQuery } from '@khlug/app/application/interest/query/listInterest/ListInterestQuery';
import { ListInterestQueryResult } from '@khlug/app/application/interest/query/listInterest/ListInterestQueryResult';

@Injectable()
@QueryHandler(ListInterestQuery)
export class ListInterestQueryHandler
  implements IQueryHandler<ListInterestQuery, ListInterestQueryResult>
{
  constructor(
    @Inject(InterestQuery)
    private readonly interestQuery: IInterestQuery,
  ) {}

  async execute(/* query: ListInterestQuery */): Promise<ListInterestQueryResult> {
    const view = await this.interestQuery.listInterest();
    return new ListInterestQueryResult(view);
  }
}
