import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { MessageBuilder } from '@khlug/core/message/MessageBuilder';
import { Transactional } from '@khlug/core/persistence/transaction/Transactional';

import { EnablePortfolioCommand } from '@khlug/app/application/group/command/enablePortfolio/EnablePortfolioCommand';

import {
  IMessenger,
  MessengerToken,
} from '@khlug/app/domain/adapter/IMessenger';
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
import { Group } from '@khlug/app/domain/group/model/Group';
import { PointGrantService } from '@khlug/app/domain/user/service/PointGrantService';

import { Message } from '@khlug/constant/error';
import { Point } from '@khlug/constant/point';
import { Template } from '@khlug/constant/template';

@CommandHandler(EnablePortfolioCommand)
export class EnablePortfolioCommandHandler
  implements ICommandHandler<EnablePortfolioCommand>
{
  constructor(
    private readonly pointGrantService: PointGrantService,
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(GroupLogger)
    private readonly groupLogger: IGroupLogger,
    @Inject(MessengerToken)
    private readonly slackSender: IMessenger,
  ) {}

  @Transactional()
  async execute(command: EnablePortfolioCommand): Promise<void> {
    const { groupId, requesterUserId } = command;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      throw new NotFoundException(Message.GROUP_NOT_FOUND);
    }

    this.checkGroupAdmin(group, requesterUserId);
    this.checkNotCustomerServiceGroup(group);

    group.enablePortfolio();
    await this.groupRepository.save(group);

    await this.groupLogger.log(groupId, '포트폴리오가 발행 중입니다.');
    await this.grantPointToMembers(group);
    this.sendMessageToAdminUser(group);
  }

  private checkGroupAdmin(group: Group, requesterUserId: number): void {
    if (group.adminUserId !== requesterUserId) {
      throw new ForbiddenException(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    }
  }

  private checkNotCustomerServiceGroup(group: Group): void {
    if (group.isCustomerServiceGroup()) {
      throw new UnprocessableEntityException(
        Message.CANNOT_MODIFY_CUSTOMER_SERVICE_GROUP,
      );
    }
  }

  private async grantPointToMembers(group: Group): Promise<void> {
    if (group.isPracticeGroup()) {
      return;
    }

    const reason = MessageBuilder.build(Template.ENABLE_GROUP_PORTFOLIO.point, {
      groupTitle: group.title,
    });

    const groupMembers = await this.groupMemberRepository.findByGroupId(
      group.id,
    );
    const userIds = groupMembers.map((groupMember) => groupMember.userId);

    await this.pointGrantService.grant({
      targetUserIds: userIds,
      amount: Point.GROUP_ENABLED_PORTFOLIO,
      reason,
    });
  }

  private sendMessageToAdminUser(group: Group): void {
    const message = MessageBuilder.build(
      Template.ENABLE_GROUP_PORTFOLIO.notification,
      { groupId: group.id, groupTitle: group.title },
    );

    this.slackSender.send({
      targetUserId: group.adminUserId,
      message,
    });
  }
}
