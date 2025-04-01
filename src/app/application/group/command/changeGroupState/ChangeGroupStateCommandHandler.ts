import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { ChangeGroupStateCommand } from '@khlug/app/application/group/command/changeGroupState/ChangeGroupStateCommand';
import { ChangeGroupStateCommandResult } from '@khlug/app/application/group/command/changeGroupState/ChangeGroupStateCommandResult';

import {
  GroupLogger,
  IGroupLogger,
} from '@khlug/app/domain/group/IGroupLogger';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';
import { GroupState } from '@khlug/app/domain/group/model/constant';

import { Message } from '@khlug/constant/error';

@CommandHandler(ChangeGroupStateCommand)
export class ChangeGroupStateCommandHandler
  implements
    ICommandHandler<ChangeGroupStateCommand, ChangeGroupStateCommandResult>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupLogger)
    private readonly groupLogger: IGroupLogger,
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

    await this.groupLogger.log(groupId, this.buildMessage(nextState));

    return new ChangeGroupStateCommandResult(group);
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
