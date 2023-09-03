import { IQuery } from '@nestjs/cqrs';
import { UserState } from '@sight/app/domain/user/model/constant';

export class ListUserQuery implements IQuery {
  constructor(
    readonly state: UserState | null,
    readonly limit: number,
    readonly offset: number,
  ) {}
}
