import { IQuery } from '@nestjs/cqrs';

import { ToUnion } from '@sight/util/types';

export const GroupListQueryType = {
  MY: 'MY',
  SUCCESS: 'SUCCESS',
  PROGRESS: 'PROGRESS',
} as const;
export type GroupListQueryType = ToUnion<typeof GroupListQueryType>;

export class ListGroupQuery implements IQuery {
  constructor(
    readonly queryType: GroupListQueryType,
    readonly keyword: string | null,
    readonly limit: number,
    readonly offset: number,
  ) {}
}
