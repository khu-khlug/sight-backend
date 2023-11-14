import { ForbiddenException, Injectable } from '@nestjs/common';

import { User } from '@sight/app/domain/user/model/User';
import {
  GroupAccessGrade,
  GroupCategory,
  ManagerOnlyGroupAccessGrade,
  ManagerOnlyGroupCategory,
} from '@sight/app/domain/group/model/constant';

import { Message } from '@sight/constant/message';

type CreateGroupParams = {
  user: User;
  category: GroupCategory;
  grade: GroupAccessGrade;
};

@Injectable()
export class GroupAuthorizer {
  createGroup(params: CreateGroupParams): void {
    const { user, category, grade } = params;

    if (user.manager) {
      return;
    }

    if (
      ManagerOnlyGroupCategory.includes(category) ||
      ManagerOnlyGroupAccessGrade.includes(grade)
    ) {
      throw new ForbiddenException(Message.CANNOT_CREATE_GROUP);
    }
  }
}
