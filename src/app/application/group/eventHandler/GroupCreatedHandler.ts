import { Inject, NotFoundException } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { GroupCreated } from '@sight/app/domain/group/event/GroupCreated';
import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { Message } from '@sight/constant/message';
import { Point } from '@sight/constant/point';
import { Transactional } from '@sight/core/persistence/transaction/Transactional';

@EventsHandler(GroupCreated)
export class GroupCreatedHandler implements IEventHandler<GroupCreated> {
  constructor(
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  @Transactional()
  async handle(event: GroupCreated): Promise<void> {
    const { group } = event;

    const authorUser = await this.userRepository.findById(group.authorUserId);
    if (!authorUser) {
      throw new NotFoundException(Message.USER_NOT_FOUND);
    }

    const reason = `${group.title} 그룹을 만들었습니다.`;
    authorUser.grantPoint(Point.GROUP_CREATED, reason);
    await this.userRepository.save(authorUser);

    this.slackSender.send({
      targetUserId: group.authorUserId,
      category: SlackMessageCategory.GROUP_ACTIVITY,
      message: `${group.title} 그룹을 만들었습니다.`,
    });
  }
}
