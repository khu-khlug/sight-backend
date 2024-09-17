import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { CreateGroupCommand } from '@sight/app/application/group/command/createGroup/CreateGroupCommand';
import { CreateGroupCommandResult } from '@sight/app/application/group/command/createGroup/CreateGroupCommandResult';

import { GroupFactory } from '@sight/app/domain/group/GroupFactory';
import { GroupMemberFactory } from '@sight/app/domain/group/GroupMemberFactory';
import { GroupState } from '@sight/app/domain/group/model/constant';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';

import { Message } from '@sight/constant/message';
import { Point } from '@sight/constant/point';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import { PointGrantService } from '@sight/app/domain/user/service/PointGrantService';

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
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
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
      category: SlackMessageCategory.GROUP_ACTIVITY,
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
