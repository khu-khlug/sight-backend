import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { EnablePortfolioCommand } from '@sight/app/application/group/command/enablePortfolio/EnablePortfolioCommand';

import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(EnablePortfolioCommand)
export class EnablePortfolioCommandHandler
  implements ICommandHandler<EnablePortfolioCommand>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
  ) {}

  @Transactional()
  async execute(command: EnablePortfolioCommand): Promise<void> {
    const { groupId, requesterUserId } = command;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }

    if (group.adminUserId !== requesterUserId) {
      throw new ForbiddenException(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    }

    if (group.isCustomerServiceGroup()) {
      throw new UnprocessableEntityException(
        Message.CANNOT_MODIFY_CUSTOMER_SERVICE_GROUP,
      );
    }

    group.enablePortfolio();
    await this.groupRepository.save(group);
  }
}
