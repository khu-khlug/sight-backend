import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { AddBookmarkCommand } from '@sight/app/application/group/command/addBookmark/AddBookmarkCommand';

import { GroupBookmarkFactory } from '@sight/app/domain/group/GroupBookmarkFactory';
import {
  GroupBookmarkRepository,
  IGroupBookmarkRepository,
} from '@sight/app/domain/group/IGroupBookmarkRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';

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
  ) {}

  @Transactional()
  async execute(command: AddBookmarkCommand): Promise<void> {
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
      return;
    }

    const newBookmark = this.groupBookmarkFactory.create({
      id: this.groupBookmarkRepository.nextId(),
      groupId,
      userId,
    });
    await this.groupBookmarkRepository.save(newBookmark);
  }
}
