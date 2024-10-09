import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetDoorLockPasswordQuery } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQuery';
import { GetDoorLockPasswordQueryResult } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryResult';
import {
  CacheQueryToken,
  ICacheQuery,
} from '@khlug/app/application/infraBlue/query/ICacheQuery';

@QueryHandler(GetDoorLockPasswordQuery)
export class GetDoorLockPasswordQueryHandler
  implements
    IQueryHandler<GetDoorLockPasswordQuery, GetDoorLockPasswordQueryResult>
{
  constructor(
    @Inject(CacheQueryToken)
    private readonly cacheQuery: ICacheQuery,
  ) {}

  async execute(): Promise<GetDoorLockPasswordQueryResult> {
    const doorLockPasswordView = await this.cacheQuery.getDoorLockPassword();
    return new GetDoorLockPasswordQueryResult(doorLockPasswordView);
  }
}
