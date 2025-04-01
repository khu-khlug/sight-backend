import {
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MessageBuilder } from '@khlug/core/message/MessageBuilder';
import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { AddBookmarkCommand } from '@khlug/app/application/group/command/addBookmark/AddBookmarkCommand';
import { AddBookmarkCommandResult } from '@khlug/app/application/group/command/addBookmark/AddBookmarkCommandResult';

import { INotifier, NotifierToken } from '@khlug/app/domain/adapter/INotifier';
import { GroupBookmarkFactory } from '@khlug/app/domain/group/GroupBookmarkFactory';
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

@CommandHandler(AddBookmarkCommand)
export class AddBookmarkCommandHandler
  implements ICommandHandler<AddBookmarkCommand>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupBookmarkFactory)
    private readonly groupBookmarkFactory: GroupBookmarkFactory,
    @Inject(GroupBookmarkRepository)
    private readonly groupBookmarkRepository: IGroupBookmarkRepository,
    @Inject(NotifierToken)
    private readonly slackSender: INotifier,
  ) {}

  @Transactional()
  async execute(
    command: AddBookmarkCommand,
  ): Promise<AddBookmarkCommandResult> {
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
    if (prevBookmark) {
      return new AddBookmarkCommandResult(prevBookmark);
    }

    const newBookmark = this.groupBookmarkFactory.create({
      id: this.groupBookmarkRepository.nextId(),
      groupId,
      userId,
    });
    await this.groupBookmarkRepository.save(newBookmark);

    this.slackSender.send({
      category: NotificationCategory.GROUP_ACTIVITY_FOR_ME,
      targetUserId: userId,
      message: MessageBuilder.build(Template.ADD_GROUP_BOOKMARK.notification, {
        groupId,
        groupTitle: group.title,
      }),
    });

    return new AddBookmarkCommandResult(newBookmark);
  }
}
