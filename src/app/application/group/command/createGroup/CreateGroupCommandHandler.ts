import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { CreateGroupCommand } from '@khlug/app/application/group/command/createGroup/CreateGroupCommand';
import { CreateGroupCommandResult } from '@khlug/app/application/group/command/createGroup/CreateGroupCommandResult';

import {
  IMessenger,
  MessengerToken,
} from '@khlug/app/domain/adapter/IMessenger';
import { GroupFactory } from '@khlug/app/domain/group/GroupFactory';
import { GroupMemberFactory } from '@khlug/app/domain/group/GroupMemberFactory';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@khlug/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';
import { GroupState } from '@khlug/app/domain/group/model/constant';
import {
  IInterestRepository,
  InterestRepository,
} from '@khlug/app/domain/interest/IInterestRepository';
import { PointGrantService } from '@khlug/app/domain/user/service/PointGrantService';

import { Message } from '@khlug/constant/error';
import { Point } from '@khlug/constant/point';

@CommandHandler(CreateGroupCommand)
export class CreateGroupCommandHandler
  implements ICommandHandler<CreateGroupCommand, CreateGroupCommandResult>
{
  constructor(
    private readonly groupFactory: GroupFactory,
    private readonly groupMemberFactory: GroupMemberFactory,
    private readonly pointGrantService: PointGrantService,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(InterestRepository)
    private readonly interestRepository: IInterestRepository,
    @Inject(MessengerToken)
    private readonly slackSender: IMessenger,
  ) {}

  @Transactional()
  async execute(
    command: CreateGroupCommand,
  ): Promise<CreateGroupCommandResult> {
    const {
      requesterUserId,
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
      authorUserId: requesterUserId,
      adminUserId: requesterUserId,
      purpose,
      interestIds,
      technology,
      grade,
      lastUpdaterUserId: requesterUserId,
      repository,
      allowJoin,
    });
    await this.groupRepository.save(newGroup);

    const groupMember = this.groupMemberFactory.create({
      id: this.groupMemberRepository.nextId(),
      userId: requesterUserId,
      groupId: newGroup.id,
    });
    await this.groupMemberRepository.save(groupMember);

    const message = `${newGroup.title} 그룹을 만들었습니다.`;
    await this.pointGrantService.grant({
      targetUserIds: [newGroup.adminUserId],
      amount: Point.GROUP_CREATED,
      reason: message,
    });

    this.slackSender.send({
      targetUserId: newGroup.adminUserId,
      message,
    });

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
