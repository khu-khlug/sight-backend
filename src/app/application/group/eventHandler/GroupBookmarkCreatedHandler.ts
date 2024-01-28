import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ClsService } from 'nestjs-cls';

import { IRequester } from '@sight/core/auth/IRequester';
import { MessageBuilder } from '@sight/core/message/MessageBuilder';
import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { GroupBookmarkCreated } from '@sight/app/domain/group/event/GroupBookmarkCreated';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Template } from '@sight/constant/template';

@EventsHandler(GroupBookmarkCreated)
export class GroupBookmarkCreatedHandler
  implements IEventHandler<GroupBookmarkCreated>
{
  constructor(
    @Inject(ClsService)
    private readonly clsService: ClsService,
    @Inject(MessageBuilder)
    private readonly messageBuilder: MessageBuilder,
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
  ) {}

  @Transactional()
  async handle(event: GroupBookmarkCreated): Promise<void> {
    const { groupId } = event;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      return;
    }

    const requester: IRequester = this.clsService.get('requester');

    const message = this.messageBuilder.build(
      Template.ADD_GROUP_BOOKMARK.notification,
      { groupId, groupTitle: group.title },
    );
    this.slackSender.send({
      category: SlackMessageCategory.GROUP_ACTIVITY_FOR_ME,
      targetUserId: requester.userId,
      message,
    });
  }
}
