import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { ModifyGroupCommand } from '@sight/app/application/group/command/modifyGroup/ModifyGroupCommand';
import { ModifyGroupCommandResult } from '@sight/app/application/group/command/modifyGroup/ModifyGroupCommandResult';

import { Group } from '@sight/app/domain/group/model/Group';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import { GroupCategory } from '@sight/app/domain/group/model/constant';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(ModifyGroupCommand)
export class ModifyGroupCommandHandler
  implements ICommandHandler<ModifyGroupCommand, ModifyGroupCommandResult>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(InterestRepository)
    private readonly interestRepository: IInterestRepository,
  ) {}

  @Transactional()
  async execute(
    command: ModifyGroupCommand,
  ): Promise<ModifyGroupCommandResult> {
    const { groupId, requesterUserId, params } = command;
    const {
      title,
      purpose,
      interestIds,
      technology,
      grade,
      repository,
      allowJoin,
      category,
    } = params;

    const group = await this.getGroupById(groupId);

    this.checkGroupAdmin(group, requesterUserId);
    await this.checkGroupMember(group, requesterUserId);

    this.checkGroupEditable(group);
    await this.checkInterestExists(interestIds);

    group.updateTitle(title);
    group.updatePurpose(purpose);
    group.updateInterestIds(interestIds);
    group.updateTechnology(technology);
    group.updateGrade(grade);
    group.updateRepository(repository);
    group.updateAllowJoin(allowJoin);
    group.updateCategory(category);
    await this.groupRepository.save(group);

    return new ModifyGroupCommandResult(group);
  }

  private async getGroupById(groupId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }
    return group;
  }

  private checkGroupAdmin(group: Group, userId: string): void {
    // 운영진 간 계층을 나타내지 않기 위해 운영 그룹은 그룹장 개념이 없음
    if (group.category === GroupCategory.MANAGE) {
      return;
    }

    if (group.adminUserId !== userId) {
      throw new ForbiddenException(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    }
  }

  private async checkGroupMember(group: Group, userId: string): Promise<void> {
    const groupMember = await this.groupMemberRepository.findByGroupIdAndUserId(
      group.id,
      userId,
    );

    if (!groupMember) {
      throw new ForbiddenException(Message.REQUESTER_NOT_JOINED_GROUP);
    }
  }

  private checkGroupEditable(group: Group): void {
    if (!group.isEditable()) {
      throw new UnprocessableEntityException(Message.GROUP_NOT_EDITABLE);
    }
  }

  private async checkInterestExists(interestIds: string[]): Promise<void> {
    const uniqueInterestIds = Array.from(new Set(interestIds));

    const uniqueInterests =
      await this.interestRepository.findByIds(uniqueInterestIds);
    if (uniqueInterestIds.length !== uniqueInterests.length) {
      throw new NotFoundException(Message.SOME_INTERESTS_NOT_FOUND);
    }
  }
}
