import { IQuery } from '@nestjs/cqrs';

import { UserState } from '@khlug/app/domain/user/model/constant';

import { Typeof } from '@khlug/util/types';

export class ListUserQuery implements IQuery {
  readonly email: string | null;
  readonly phone: string | null;
  readonly name: string | null;
  readonly number: string | null;
  readonly college: string | null;
  readonly grade: number | null;
  readonly state: UserState | null;
  readonly limit: number;
  readonly offset: number;

  constructor(params: Typeof<ListUserQuery>) {
    this.email = params.email;
    this.phone = params.phone;
    this.name = params.name;
    this.number = params.number;
    this.college = params.college;
    this.grade = params.grade;
    this.state = params.state;
    this.limit = params.limit;
    this.offset = params.offset;
  }
}
