import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { GroupUpdated } from '@sight/app/domain/group/event/GroupUpdated';
import { GroupLogFactory } from '@sight/app/domain/group/GroupLogFactory';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupLogRepository,
  IGroupLogRepository,
} from '@sight/app/domain/group/IGroupLogRepository';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  GroupUpdatedMessageBuilder,
  IGroupUpdatedMessageBuilder,
} from '@sight/app/domain/group/messageBuilder/IGroupUpdatedMessageBuilder';

@EventsHandler(GroupUpdated)
export class GroupUpdatedHandler implements IEventHandler<GroupUpdated> {
  constructor(
    @Inject(GroupLogFactory)
    private readonly groupLogFactory: GroupLogFactory,
    @Inject(GroupLogRepository)
    private readonly groupLogRepository: IGroupLogRepository,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(GroupUpdatedMessageBuilder)
    private readonly messageBuilder: IGroupUpdatedMessageBuilder,
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
  ) {}

  @Transactional()
  async handle(event: GroupUpdated): Promise<void> {
    const { groupId, updatedItem } = event;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      return;
    }

    const message = this.messageBuilder.build(updatedItem);

    const newGroupLog = this.groupLogFactory.create({
      id: this.groupLogRepository.nextId(),
      groupId,
      userId: group.adminUserId,
      message,
    });
    await this.groupLogRepository.save(newGroupLog);

    const members = await this.groupMemberRepository.findByGroupId(groupId);
    members.forEach((member) =>
      this.slackSender.send({
        sourceUserId: null,
        targetUserId: member.userId,
        category: SlackMessageCategory.GROUP_ACTIVITY,
        message,
      }),
    );
  }
}
