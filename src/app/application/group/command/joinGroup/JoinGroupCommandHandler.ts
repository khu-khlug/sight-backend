import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { JoinGroupCommand } from '@sight/app/application/group/command/joinGroup/JoinGroupCommand';

import { GroupDomainService } from '@sight/app/domain/group/service/GroupDomainService';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(JoinGroupCommand)
export class JoinGroupCommandHandler
  implements ICommandHandler<JoinGroupCommand>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(GroupDomainService)
    private readonly groupDomainService: GroupDomainService,
  ) {}

  @Transactional()
  async execute(command: JoinGroupCommand): Promise<void> {
    const { groupId, userId } = command;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    await this.groupDomainService.joinGroup(group, user);
  }
}
