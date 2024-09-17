import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { EnablePortfolioCommand } from '@sight/app/application/group/command/enablePortfolio/EnablePortfolioCommand';

import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';
import { Group } from '@sight/app/domain/group/model/Group';
import { Template } from '@sight/constant/template';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupLogger,
  IGroupLogger,
} from '@sight/app/domain/group/IGroupLogger';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import { MessageBuilder } from '@sight/core/message/MessageBuilder';
import { PointGrantService } from '@sight/app/domain/user/service/PointGrantService';
import { Point } from '@sight/constant/point';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';

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
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
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

  private checkGroupAdmin(group: Group, requesterUserId: string): void {
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
      category: SlackMessageCategory.GROUP_ACTIVITY,
      targetUserId: group.adminUserId,
      message,
    });
  }
}
