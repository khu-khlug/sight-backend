import {
  ForbiddenException,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';

import { GroupMemberFactory } from '@sight/app/domain/group/GroupMemberFactory';
import { Group } from '@sight/app/domain/group/model/Group';
import { GroupAuthorizer } from '@sight/app/domain/group/service/GroupAuthorizer';
import { User } from '@sight/app/domain/user/model/User';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';

import { Message } from '@sight/constant/message';

@Injectable()
export class GroupDomainService {
  constructor(
    @Inject(GroupMemberFactory)
    private readonly groupMemberFactory: GroupMemberFactory,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(GroupAuthorizer)
    private readonly groupAuthorizer: GroupAuthorizer,
  ) {}

  async joinGroup(group: Group, user: User): Promise<void> {
    if (!group.allowJoin) {
      throw new UnprocessableEntityException(Message.GROUP_JOIN_NOT_ALLOWED);
    }

    const canReadGroup = await this.groupAuthorizer.canRead(group, user);
    if (!canReadGroup) {
      throw new ForbiddenException(Message.CANNOT_READ_GROUP);
    }

    if (group.isCustomerServiceGroup()) {
      // 모든 유저는 고객센터 그룹에 가입되어 있으므로 가입 시도 시 예외 처리
      throw new UnprocessableEntityException(Message.ALREADY_JOINED_GROUP);
    }

    const isAlreadyMember = await this.groupAuthorizer.isMember(group, user.id);
    if (isAlreadyMember) {
      throw new UnprocessableEntityException(Message.ALREADY_JOINED_GROUP);
    }

    const groupMember = this.groupMemberFactory.create({
      id: this.groupMemberRepository.nextId(),
      groupId: group.id,
      userId: user.id,
    });
    await this.groupMemberRepository.save(groupMember);
  }
}
