import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { DisablePortfolioCommand } from '@sight/app/application/group/command/disablePortfolio/DisablePortfolioCommand';

import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(DisablePortfolioCommand)
export class DisablePortfolioCommandHandler
  implements ICommandHandler<DisablePortfolioCommand>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
  ) {}

  async execute(command: DisablePortfolioCommand): Promise<void> {
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

    group.disablePortfolio();
    await this.groupRepository.save(group);
  }
}
