import { IQuery } from '@nestjs/cqrs';

export class ListGroupMemberQuery implements IQuery {
  constructor(
    readonly groupId: string,
    readonly limit: number,
    readonly offset: number,
  ) {}
}
