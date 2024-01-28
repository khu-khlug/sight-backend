import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { RemoveBookmarkCommand } from '@sight/app/application/group/command/removeBookmark/RemoveBookmarkCommand';

import {
  GroupBookmarkRepository,
  IGroupBookmarkRepository,
} from '@sight/app/domain/group/IGroupBookmarkRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(RemoveBookmarkCommand)
export class RemoveBookmarkCommandHandler
  implements ICommandHandler<RemoveBookmarkCommand>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupBookmarkRepository)
    private readonly groupBookmarkRepository: IGroupBookmarkRepository,
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

    prevBookmark.remove();
    await this.groupBookmarkRepository.remove(prevBookmark);
  }
}
