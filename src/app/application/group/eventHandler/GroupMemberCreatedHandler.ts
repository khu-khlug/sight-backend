import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MessageBuilder } from '@sight/core/message/MessageBuilder';
import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { GroupMemberCreated } from '@sight/app/domain/group/event/GroupMemberCreated';
import { GroupAccessGrade } from '@sight/app/domain/group/model/constant';
import { Group } from '@sight/app/domain/group/model/Group';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import { User } from '@sight/app/domain/user/model/User';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupLogger,
  IGroupLogger,
} from '@sight/app/domain/group/IGroupLogger';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { Point } from '@sight/constant/point';
import { Template } from '@sight/constant/template';

@EventsHandler(GroupMemberCreated)
export class GroupMemberCreatedHandler
  implements IEventHandler<GroupMemberCreated>
{
  constructor(
    @Inject(GroupLogger)
    private readonly groupLogger: IGroupLogger,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
    @Inject(MessageBuilder)
    private readonly messageBuilder: MessageBuilder,
  ) {}

  @Transactional()
  async handle(event: GroupMemberCreated): Promise<void> {
    const { groupId, userId } = event;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      return;
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      return;
    }

    await this.groupLogger.log(groupId, '그룹에 참여했습니다.');
    await this.sendMessage(group, user);

    if (!group.isPracticeGroup()) {
      await this.grantPoint(group, user);
    }

    group.wake();
    await this.groupRepository.save(group);
  }

  private async sendMessage(group: Group, user: User): Promise<void> {
    let sendTargetUserIds = [group.adminUserId];

    if (group.grade === GroupAccessGrade.MANAGER) {
      const members = await this.groupMemberRepository.findByGroupId(group.id);
      sendTargetUserIds = members.map((member) => member.userId);
    }

    this.slackSender.send({
      category: SlackMessageCategory.GROUP_ACTIVITY_FOR_ME,
      targetUserId: user.id,
      message: this.messageBuilder.build(Template.JOIN_GROUP.notification, {
        groupId: group.id,
        groupTitle: group.title,
      }),
    });

    sendTargetUserIds.forEach((targetUserId) => {
      this.slackSender.send({
        category: SlackMessageCategory.GROUP_ACTIVITY_AS_ADMIN,
        targetUserId,
        message: this.messageBuilder.build(Template.JOIN_GROUP.notification, {
          groupId: group.id,
          groupTitle: group.title,
        }),
      });
    });
  }

  private async grantPoint(group: Group, user: User): Promise<void> {
    const reason = this.messageBuilder.build(Template.JOIN_GROUP.point, {
      groupTitle: group.title,
    });
    user.grantPoint(Point.GROUP_JOINED, reason);
    await this.userRepository.save(user);
  }
}
