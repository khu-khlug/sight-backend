import { UserResponse } from '@khlug/app/interface/user/manager/dto/common/UserResponse';
import { DtoBuilder } from '@khlug/app/interface/util/DtoBuilder';

import { ListUserQueryResult } from '@khlug/app/application/user/query/listUser/ListUserQueryResult';

export class ListUserResponseDto {
  count!: number;
  users!: UserResponse[];

  static buildFromQueryResult({
    view,
  }: ListUserQueryResult): ListUserResponseDto {
    return DtoBuilder.build(ListUserResponseDto, {
      count: view.count,
      users: view.users.map((user) => ({
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
        active: user.active,
        manager: user.manager,
        slack: user.slack,
        rememberToken: user.rememberToken,
        khuisAuthAt: user.khuisAuthAt,
        returnAt: user.returnAt,
        returnReason: user.returnReason,
        lastLoginAt: user.lastLoginAt,
        lastEnterAt: user.lastEnterAt,
        normalTags: user.normalTags,
        redTags: user.redTags,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  }
}
