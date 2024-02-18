import { Injectable } from '@nestjs/common';

import { GroupMemberCreated } from '@sight/app/domain/group/event/GroupMemberCreated';
import {
  GroupMember,
  GroupMemberConstructorParams,
} from '@sight/app/domain/group/model/GroupMember';

type GroupMemberCreateParams = Omit<GroupMemberConstructorParams, 'createdAt'>;
type GroupMemberReconstituteParams = GroupMemberConstructorParams;

@Injectable()
export class GroupMemberFactory {
  create(params: GroupMemberCreateParams): GroupMember {
    const now = new Date();

    const newGroupMember = new GroupMember({ ...params, createdAt: now });
    newGroupMember.apply(new GroupMemberCreated(params.groupId, params.userId));

    return newGroupMember;
  }

  reconstitute(params: GroupMemberReconstituteParams): GroupMember {
    return new GroupMember(params);
  }
}
