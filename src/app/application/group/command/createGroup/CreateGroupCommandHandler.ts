import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { CreateGroupCommand } from '@sight/app/application/group/command/createGroup/CreateGroupCommand';
import { CreateGroupCommandResult } from '@sight/app/application/group/command/createGroup/CreateGroupCommandResult';

import { GroupFactory } from '@sight/app/domain/group/GroupFactory';
import { GroupMemberFactory } from '@sight/app/domain/group/GroupMemberFactory';
import { GroupState } from '@sight/app/domain/group/model/constant';
import { GroupInterestFactory } from '@sight/app/domain/interest/GroupInterestFactory';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  GroupInterestRepository,
  IGroupInterestRepository,
} from '@sight/app/domain/interest/IGroupInterestRepository';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(CreateGroupCommand)
export class CreateGroupCommandHandler
  implements ICommandHandler<CreateGroupCommand, CreateGroupCommandResult>
{
  constructor(
    @Inject(GroupFactory)
    private readonly groupFactory: GroupFactory,
    @Inject(GroupMemberFactory)
    private readonly groupMemberFactory: GroupMemberFactory,
    @Inject(GroupInterestFactory)
    private readonly groupInterestFactory: GroupInterestFactory,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(GroupInterestRepository)
    private readonly groupInterestRepository: IGroupInterestRepository,
    @Inject(InterestRepository)
    private readonly interestRepository: IInterestRepository,
  ) {}

  @Transactional()
  async execute(
    command: CreateGroupCommand,
  ): Promise<CreateGroupCommandResult> {
    const {
      userId,
      title,
      category,
      grade,
      interestIds,
      purpose,
      technology,
      allowJoin,
      repository,
    } = command;

    const uniqueInterestIds = Array.from(new Set(interestIds));
    await this.checkInterestExists(uniqueInterestIds);

    const newGroup = this.groupFactory.create({
      id: this.groupRepository.nextId(),
      category,
      state: GroupState.PROGRESS,
      title,
      authorUserId: userId,
      adminUserId: userId,
      purpose,
      technology,
      grade,
      lastUpdaterUserId: userId,
      repository,
      allowJoin,
    });
    await this.groupRepository.save(newGroup);

    const groupMember = this.groupMemberFactory.create({
      id: this.groupMemberRepository.nextId(),
      userId,
      groupId: newGroup.id,
    });
    await this.groupMemberRepository.save(groupMember);

    const groupInterests = uniqueInterestIds.map((interestId) =>
      this.groupInterestFactory.create({
        id: this.groupInterestRepository.nextId(),
        interestId,
        groupId: newGroup.id,
      }),
    );
    await this.groupInterestRepository.save(...groupInterests);

    return new CreateGroupCommandResult(newGroup);
  }

  private async checkInterestExists(
    uniqueInterestIds: string[],
  ): Promise<void> {
    const interests =
      await this.interestRepository.findByIds(uniqueInterestIds);

    if (interests.length !== uniqueInterestIds.length) {
      throw new NotFoundException(Message.SOME_INTERESTS_NOT_FOUND);
    }
  }
}
