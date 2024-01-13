import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { GroupPortfolioEnabled } from '@sight/app/domain/group/event/GroupPortfolioEnabled';
import { GroupLogFactory } from '@sight/app/domain/group/GroupLogFactory';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupLogRepository,
  IGroupLogRepository,
} from '@sight/app/domain/group/IGroupLogRepository';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { Point } from '@sight/constant/point';

@EventsHandler(GroupPortfolioEnabled)
export class GroupPortfolioEnabledHandler
  implements IEventHandler<GroupPortfolioEnabled>
{
  constructor(
    @Inject(GroupRepository)
    private readonly groupRepository: IGroupRepository,
    @Inject(GroupMemberRepository)
    private readonly groupMemberRepository: IGroupMemberRepository,
    @Inject(GroupLogFactory)
    private readonly groupLogFactory: GroupLogFactory,
    @Inject(GroupLogRepository)
    private readonly groupLogRepository: IGroupLogRepository,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
  ) {}

  @Transactional()
  async handle(event: GroupPortfolioEnabled): Promise<void> {
    const { groupId } = event;

    const group = await this.groupRepository.findById(groupId);
    if (!group) {
      return;
    }

    const groupMembers =
      await this.groupMemberRepository.findByGroupId(groupId);
    const userIds = groupMembers.map((groupMember) => groupMember.userId);
    const users = await this.userRepository.findByIds(userIds);

    users.forEach((user) =>
      user.grantPoint(
        Point.GROUP_ENABLED_PORTFOLIO,
        `<u>${group.title}</u> 그룹의 포트폴리오가 발행되었습니다.`,
      ),
    );
    await this.userRepository.save(...users);

    // TODO: 그룹 로거를 만들어서 사용하도록 수정
    const groupLog = this.groupLogFactory.create({
      id: this.groupLogRepository.nextId(),
      groupId,
      userId: '', // TODO: 요청자 정보에 접근할 수 있을 때 수정
      message: '포트폴리오가 발행 중입니다.',
    });
    await this.groupLogRepository.save(groupLog);

    this.slackSender.send({
      category: SlackMessageCategory.GROUP_ACTIVITY,
      message: `<a href="/group/'${groupId}'"><u>${group.title}</u></a> 그룹의 <a href="/folio/'${groupId}'" target="_blank">포트폴리오</a>가 발행 중입니다.`,
      sourceUserId: null,
      targetUserId: '', // TODO: 요청자 정보에 접근할 수 있을 때 수정
    });
  }
}
