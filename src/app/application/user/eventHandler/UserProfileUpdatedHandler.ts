import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import {
  IMessenger,
  MessengerToken,
} from '@khlug/app/domain/adapter/IMessenger';
import { UserProfileUpdated } from '@khlug/app/domain/user/event/UserProfileUpdated';

@EventsHandler(UserProfileUpdated)
export class UserProfileUpdatedHandler
  implements IEventHandler<UserProfileUpdated>
{
  constructor(
    @Inject(MessengerToken)
    private readonly slackSender: IMessenger,
  ) {}

  handle(event: UserProfileUpdated) {
    const { user } = event;

    this.slackSender.send({
      targetUserId: user.id,
      message: '회원 정보를 수정했습니다.',
    });
  }
}
