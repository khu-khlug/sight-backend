import { Injectable } from '@nestjs/common';

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
    return new GroupMember({ ...params, createdAt: now });
  }

  reconstitute(params: GroupMemberReconstituteParams): GroupMember {
    return new GroupMember(params);
  }
}
