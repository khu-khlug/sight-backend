import { Inject, Injectable } from '@nestjs/common';

import { GroupAccessGrade } from '@sight/app/domain/group/model/constant';
import { Group } from '@sight/app/domain/group/model/Group';
import { UserState } from '@sight/app/domain/user/model/constant';
import { User } from '@sight/app/domain/user/model/User';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';

@Injectable()
export class GroupAuthorizer {
  constructor(
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
  ) {}

  async canRead(group: Group, user: User): Promise<boolean> {
    const isMember = await this.isMember(group, user.id);
    if (isMember) {
      return true;
    }

    switch (group.grade) {
      case GroupAccessGrade.PRIVATE:
        return group.adminUserId === user.id;
      case GroupAccessGrade.MANAGER:
        return user.manager;
      case GroupAccessGrade.MEMBER:
        return Array.from<UserState>([
          UserState.ABSENCE,
          UserState.UNDERGRADUATE,
          UserState.GRADUATE,
        ]).includes(user.state);
      case GroupAccessGrade.ALL:
        return true;
    }
  }

  async isMember(group: Group, userId: string): Promise<boolean> {
    if (group.isCustomerServiceGroup()) {
      return true;
    }

    const member = await this.groupMemberRepository.findByGroupIdAndUserId(
      group.id,
      userId,
    );

    return !!member;
  }
}
