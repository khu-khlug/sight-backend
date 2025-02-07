import { EntityRepository } from '@mikro-orm/mysql';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ListUserQuery } from '@khlug/app/application/user/query/listUser/ListUserQuery';
import { ListUserQueryResult } from '@khlug/app/application/user/query/listUser/ListUserQueryResult';
import { UserWithTagListView } from '@khlug/app/application/user/query/view/UserListView';

import { FeeHistory } from '@khlug/app/domain/fee/model/FeeHistory';
import { UserStatus } from '@khlug/app/domain/user/model/constant';
import { User } from '@khlug/app/domain/user/model/User';

import { UnivPeriod } from '@khlug/util/univPeriod';

@Injectable()
@QueryHandler(ListUserQuery)
export class ListUserQueryHandler
  implements IQueryHandler<ListUserQuery, ListUserQueryResult>
{
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    @InjectRepository(FeeHistory)
    private readonly feeHistoryRepository: EntityRepository<FeeHistory>,
  ) {}

  async execute(query: ListUserQuery): Promise<ListUserQueryResult> {
    const {
      email,
      phone,
      name,
      number,
      college,
      grade,
      studentStatus,
      limit,
      offset,
    } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    if (email) {
      qb.andWhere('email LIKE ?', [`%${email}%`]);
    }

    if (phone) {
      qb.andWhere('phone LIKE ?', [`%${phone}%`]);
    }

    if (name) {
      qb.andWhere('realname LIKE ?', [`%${name}%`]);
    }

    if (number) {
      qb.andWhere('number LIKE ?', [`%${number}%`]);
    }

    if (college) {
      qb.andWhere('college LIKE ?', [`%${college}%`]);
    }

    if (grade) {
      qb.andWhere('grade = ?', [grade]);
    }

    if (studentStatus) {
      qb.andWhere('state = ?', [studentStatus]);
    }

    const [users, count] = await qb
      .limit(limit)
      .offset(offset)
      .orderBy({ id: 'ASC' })
      .getResultAndCount();

    const feeTargetUserIds = users
      .filter((user) => user.needPayFee())
      .map((user) => user.id);
    const thisTerm = UnivPeriod.fromDate(new Date()).toTerm();

    const feeHistories = await this.feeHistoryRepository.find({
      user: { $in: feeTargetUserIds },
      year: thisTerm.year,
      semester: thisTerm.semester,
    });
    const userFeeHistorySet = new Set<number>(
      feeHistories.map((feeHistory) => feeHistory.user),
    );

    const listView: UserWithTagListView = {
      count,
      users: users.map((user) => {
        const normalTags: string[] = [];
        const redTags: string[] = [];

        if (user.needAuth()) {
          redTags.push('미인증');
        }

        if (user.status === UserStatus.INACTIVE) {
          redTags.push('차단');
        }

        if (user.point < 0) {
          redTags.push('-exp');
        }

        if (user.needPayFee() && !userFeeHistorySet.has(user.id)) {
          if (user.needPayHalfFee()) {
            normalTags.push('반액 납부 대상');
          } else {
            normalTags.push('납부 대상');
          }
        }

        return {
          id: user.id,
          name: user.name,
          profile: {
            name: user.profile.name,
            college: user.profile.college,
            grade: user.profile.grade,
            number: user.profile.number,
            email: user.profile.email,
            phone: user.profile.phone,
            homepage: user.profile.homepage,
            language: user.profile.language,
            prefer: user.profile.prefer,
          },
          admission: user.admission,
          studentStatus: user.studentStatus,
          point: user.point,
          status: user.status,
          manager: user.manager,
          slack: user.slack,
          rememberToken: user.rememberToken,
          khuisAuthAt: user.khuisAuthAt,
          returnAt: user.returnAt,
          returnReason: user.returnReason,
          lastLoginAt: user.lastLoginAt,
          lastEnterAt: user.lastEnterAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          normalTags,
          redTags,
        };
      }),
    };
    return new ListUserQueryResult(listView);
  }
}
