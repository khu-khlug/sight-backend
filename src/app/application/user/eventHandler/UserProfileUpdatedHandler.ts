import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { SlackMessageCategory } from '@sight/app/domain/message/model/constant';
import { UserProfileUpdated } from '@sight/app/domain/user/event/UserProfileUpdated';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';

@EventsHandler(UserProfileUpdated)
export class UserProfileUpdatedHandler
  implements IEventHandler<UserProfileUpdated>
{
  constructor(
    @Inject(SlackSender)
    private readonly slackSender: ISlackSender,
  ) {}

  handle(event: UserProfileUpdated) {
    const { user } = event;

    this.slackSender.send({
      targetUserId: user.id,
      message: '회원 정보를 수정했습니다.',
      category: SlackMessageCategory.USER_DATA,
    });
  }
}
