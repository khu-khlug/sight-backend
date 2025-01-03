import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ListUserQuery } from '@khlug/app/application/user/query/listUser/ListUserQuery';
import { ListUserQueryResult } from '@khlug/app/application/user/query/listUser/ListUserQueryResult';
import { UserListView } from '@khlug/app/application/user/query/view/UserListView';

import { User } from '@khlug/app/domain/user/model/User';

@Injectable()
@QueryHandler(ListUserQuery)
export class ListUserQueryHandler
  implements IQueryHandler<ListUserQuery, ListUserQueryResult>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
  ) {}

  async execute(query: ListUserQuery): Promise<ListUserQueryResult> {
    const { email, name, college, grade, state, limit, offset } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    if (email) {
      qb.andWhere('profile.email LIKE ?', [`%${email}%`]);
    }

    if (name) {
      qb.andWhere('profile.name LIKE ?', [`%${name}%`]);
    }

    if (college) {
      qb.andWhere('profile.college LIKE ?', [`%${college}%`]);
    }

    if (grade) {
      qb.andWhere('profile.grade = ?', [grade]);
    }

    if (state) {
      qb.andWhere('profile.state = ?', [state]);
    }

    const [users, count] = await qb
      .limit(limit)
      .offset(offset)
      .orderBy({ id: 'ASC' })
      .getResultAndCount();

    const listView: UserListView = { count, users };
    return new ListUserQueryResult(listView);
  }
}
