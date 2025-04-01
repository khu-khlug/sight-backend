import {
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MessageBuilder } from '@khlug/core/message/MessageBuilder';
import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { RemoveBookmarkCommand } from '@khlug/app/application/group/command/removeBookmark/RemoveBookmarkCommand';

import { INotifier, NotifierToken } from '@khlug/app/domain/adapter/INotifier';
import {
  GroupBookmarkRepository,
  IGroupBookmarkRepository,
} from '@khlug/app/domain/group/IGroupBookmarkRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';
import { NotificationCategory } from '@khlug/constant/notification';

import { Message } from '@khlug/constant/error';
import { Template } from '@khlug/constant/template';

@CommandHandler(RemoveBookmarkCommand)
export class RemoveBookmarkCommandHandler
  implements ICommandHandler<RemoveBookmarkCommand>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupBookmarkRepository)
    private readonly groupBookmarkRepository: IGroupBookmarkRepository,
    @Inject(NotifierToken)
    private readonly slackSender: INotifier,
  ) {}

  @Transactional()
  async execute(command: RemoveBookmarkCommand): Promise<void> {
    const { groupId, userId } = command;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }

    if (group.isCustomerServiceGroup() || group.isPracticeGroup()) {
      throw new UnprocessableEntityException(Message.DEFAULT_BOOKMARKED_GROUP);
    }

    const prevBookmark =
      await this.groupBookmarkRepository.findByGroupIdAndUserId(
        groupId,
        userId,
      );
    if (!prevBookmark) {
      return;
    }
    await this.groupBookmarkRepository.remove(prevBookmark);

    this.slackSender.send({
      category: NotificationCategory.GROUP_ACTIVITY_FOR_ME,
      targetUserId: userId,
      message: MessageBuilder.build(
        Template.REMOVE_GROUP_BOOKMARK.notification,
        { groupId, groupTitle: group.title },
      ),
    });
  }
}
