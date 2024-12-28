import { IQuery } from '@nestjs/cqrs';

import { UserState } from '@khlug/app/domain/user/model/constant';

import { Typeof } from '@khlug/util/types';

export class ListUserQuery implements IQuery {
  readonly email: string | null;
  readonly name: string | null;
  readonly college: string | null;
  readonly grade: number | null;
  readonly state: UserState | null;
  readonly limit: number;
  readonly offset: number;

  constructor(params: Typeof<ListUserQuery>) {
    this.email = params.email;
    this.name = params.name;
    this.college = params.college;
    this.grade = params.grade;
    this.state = params.state;
    this.limit = params.limit;
    this.offset = params.offset;
  }
}
