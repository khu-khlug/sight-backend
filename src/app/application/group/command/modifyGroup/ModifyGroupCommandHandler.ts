import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import {
  ModifyGroupCommand,
  ModifyGroupParams,
} from '@khlug/app/application/group/command/modifyGroup/ModifyGroupCommand';
import { ModifyGroupCommandResult } from '@khlug/app/application/group/command/modifyGroup/ModifyGroupCommandResult';

import {
  GroupLogger,
  IGroupLogger,
} from '@khlug/app/domain/group/IGroupLogger';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@khlug/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';
import { GroupCategory } from '@khlug/app/domain/group/model/constant';
import { Group } from '@khlug/app/domain/group/model/Group';
import {
  IInterestRepository,
  InterestRepository,
} from '@khlug/app/domain/interest/IInterestRepository';

import { Message } from '@khlug/constant/message';
import { isDifferentStringArray } from '@khlug/util/isDifferentStringArray';

type UpdatedItem =
  | 'category'
  | 'title'
  | 'purpose'
  | 'interests'
  | 'technology'
  | 'grade'
  | 'repository'
  | 'allowJoin';

const updatedItemToKorean: Record<UpdatedItem, string> = {
  category: '분류',
  title: '그룹 이름',
  purpose: '목표',
  interests: 'IT 분야',
  technology: '기술',
  grade: '공개 범위',
  repository: '저장소',
  allowJoin: '참여 신청 허용 여부',
};

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
    @Inject(GroupLogger)
    private readonly groupLogger: IGroupLogger,
  ) {}

  @Transactional()
  async execute(
    command: ModifyGroupCommand,
  ): Promise<ModifyGroupCommandResult> {
    const { groupId, requesterUserId, params } = command;
    const {
      category,
      title,
      purpose,
      interestIds,
      technology,
      grade,
      repository,
      allowJoin,
    } = params;

    const group = await this.getGroupOrThrow(groupId);

    this.checkGroupAdmin(group, requesterUserId);
    await this.checkGroupMember(group, requesterUserId);

    this.checkGroupEditable(group);
    await this.checkInterestExists(interestIds);

    const updatedItems = this.diffUpdatedItem(group, params);
    if (updatedItems.length === 0) {
      return new ModifyGroupCommandResult(group);
    }

    group.updateCategory(category);
    group.updateTitle(title);
    group.updatePurpose(purpose);
    group.updateInterestIds(interestIds);
    group.updateTechnology(technology);
    group.updateGrade(grade);
    group.updateRepository(repository);
    group.updateAllowJoin(allowJoin);
    await this.groupRepository.save(group);

    const message = this.buildMessage(group, updatedItems);
    await this.groupLogger.log(groupId, message);

    return new ModifyGroupCommandResult(group);
  }

  private async getGroupOrThrow(groupId: string): Promise<Group> {
    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }
    return group;
  }

  private checkGroupAdmin(group: Group, userId: number): void {
    // 운영진 간 계층을 나타내지 않기 위해 운영 그룹은 그룹장 개념이 없음
    if (group.category === GroupCategory.MANAGE) {
      return;
    }

    if (group.adminUserId !== userId) {
      throw new ForbiddenException(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    }
  }

  private async checkGroupMember(group: Group, userId: number): Promise<void> {
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

  private diffUpdatedItem(
    group: Group,
    params: ModifyGroupParams,
  ): UpdatedItem[] {
    const updatedItems: UpdatedItem[] = [];

    if (group.category !== params.category) updatedItems.push('category');

    if (group.title !== params.title) updatedItems.push('title');

    if (group.purpose !== params.purpose) updatedItems.push('purpose');

    if (isDifferentStringArray(group.interestIds, params.interestIds))
      updatedItems.push('interests');

    if (isDifferentStringArray(group.technology, params.technology))
      updatedItems.push('technology');

    if (group.grade !== params.grade) updatedItems.push('grade');

    if (group.repository !== params.repository) updatedItems.push('repository');

    if (group.allowJoin !== params.allowJoin) updatedItems.push('allowJoin');

    return updatedItems;
  }

  private buildMessage(group: Group, updatedItems: UpdatedItem[]): string {
    const updateItemsString = updatedItems
      .map((item) => updatedItemToKorean[item])
      .join(', ');
    return `${group.title} 그룹의 ${updateItemsString}이(가) 수정되었습니다.`;
  }
}
