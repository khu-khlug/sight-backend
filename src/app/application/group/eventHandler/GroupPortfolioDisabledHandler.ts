import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClsService } from 'nestjs-cls';

import { IRequester } from '@sight/core/auth/IRequester';
import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { GroupPortfolioDisabled } from '@sight/app/domain/group/event/GroupPortfolioDisabled';
import { Group } from '@sight/app/domain/group/model/Group';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
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
import { MessageBuilder } from '@sight/core/message/MessageBuilder';
import { Template } from '@sight/constant/template';

@EventsHandler(GroupPortfolioDisabled)
export class GroupPortfolioDisabledHandler
  implements IEventHandler<GroupPortfolioDisabled>
{
  constructor(
    private readonly clsService: ClsService,
    private readonly messageBuilder: MessageBuilder,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(GroupLogger)
    private readonly groupLogger: IGroupLogger,
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
  ) {}

  @Transactional()
  async handle(event: GroupPortfolioDisabled): Promise<void> {
    const { groupId } = event;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      return;
    }

    await this.groupLogger.log(groupId, '포트폴리오 발행이 중단되었습니다.');
    await this.retrievePointFromMembers(group);

    const requester: IRequester = this.clsService.get('requester');
    const message = this.messageBuilder.build(
      Template.DISABLE_GROUP_PORTFOLIO.notification,
      { groupId: group.id, groupTitle: group.title },
    );

    this.slackSender.send({
      category: SlackMessageCategory.GROUP_ACTIVITY,
      targetUserId: requester.userId,
      message,
    });
  }

  private async retrievePointFromMembers(group: Group): Promise<void> {
    if (group.isPracticeGroup()) {
      return;
    }

    const groupMembers = await this.groupMemberRepository.findByGroupId(
      group.id,
    );
    const userIds = groupMembers.map((groupMember) => groupMember.userId);
    const users = await this.userRepository.findByIds(userIds);

    const reason = this.messageBuilder.build(
      Template.DISABLE_GROUP_PORTFOLIO.point,
      { groupTitle: group.title },
    );

    users.forEach((user) =>
      user.grantPoint(-Point.GROUP_ENABLED_PORTFOLIO, reason),
    );
    await this.userRepository.save(...users);
  }
}
