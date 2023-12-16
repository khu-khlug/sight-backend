import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { ChangeGroupStateCommand } from '@sight/app/application/group/command/changeGroupState/ChangeGroupStateCommand';
import { ChangeGroupStateCommandResult } from '@sight/app/application/group/command/changeGroupState/ChangeGroupStateCommandResult';

import { GroupLogFactory } from '@sight/app/domain/group/GroupLogFactory';
import { GroupState } from '@sight/app/domain/group/model/constant';
import {
  GroupLogRepository,
  IGroupLogRepository,
} from '@sight/app/domain/group/IGroupLogRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';

@CommandHandler(ChangeGroupStateCommand)
export class ChangeGroupStateCommandHandler
  implements
    ICommandHandler<ChangeGroupStateCommand, ChangeGroupStateCommandResult>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupLogFactory)
    private readonly groupLogFactory: GroupLogFactory,
    @Inject(GroupLogRepository)
    private readonly groupLogRepository: IGroupLogRepository,
  ) {}

  @Transactional()
  async execute(
    command: ChangeGroupStateCommand,
  ): Promise<ChangeGroupStateCommandResult> {
    const { requester, groupId, nextState } = command;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }

    if (group.isCustomerServiceGroup() || group.isPracticeGroup()) {
      throw new UnprocessableEntityException(Message.GROUP_NOT_EDITABLE);
    }

    if (group.adminUserId !== requester.userId && !requester.isManager) {
      throw new ForbiddenException(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    }

    if (nextState === GroupState.SUSPEND && !requester.isManager) {
      throw new ForbiddenException(Message.ONLY_MANAGER_CAN_SUSPEND_GROUP);
    }

    group.changeState(nextState);
    group.wake();
    await this.groupRepository.save(group);

    const newGroupLog = this.groupLogFactory.create({
      id: this.groupLogRepository.nextId(),
      groupId,
      userId: requester.userId,
      message: this.buildMessage(nextState),
    });
    await this.groupLogRepository.save(newGroupLog);

    return new ChangeGroupStateCommandResult(nextState);
  }

  private buildMessage(nextState: GroupState): string {
    switch (nextState) {
      case 'PROGRESS':
        return '그룹이 진행 중입니다.';
      case 'END_SUCCESS':
        return '그룹이 종료(성공)되었습니다.';
      case 'END_FAIL':
        return '그룹이 종료(실패)되었습니다.';
      case 'SUSPEND':
        return '그룹이 중단 처리되었습니다.';
      case 'PENDING':
        return 'not reachable';
    }
  }
}
