import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { MessageBuilder } from '@sight/core/message/MessageBuilder';

import { GroupBookmarkRemoved } from '@sight/app/domain/group/event/GroupBookmarkRemoved';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import {
  SlackSender,
  ISlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Template } from '@sight/constant/template';

@EventsHandler(GroupBookmarkRemoved)
export class GroupBookmarkRemovedHandler
  implements IEventHandler<GroupBookmarkRemoved>
{
  constructor(
    @Inject(MessageBuilder)
    private readonly messageBuilder: MessageBuilder,
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
  ) {}

  async handle(event: GroupBookmarkRemoved): Promise<void> {
    const { groupId, userId } = event;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      return;
    }

    const message = this.messageBuilder.build(
      Template.REMOVE_GROUP_BOOKMARK.notification,
      { groupId, groupTitle: group.title },
    );
    this.slackSender.send({
      category: SlackMessageCategory.GROUP_ACTIVITY_FOR_ME,
      targetUserId: userId,
      message,
    });
  }
}
