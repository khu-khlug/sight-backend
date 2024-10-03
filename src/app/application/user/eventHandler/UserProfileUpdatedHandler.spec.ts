import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { UserProfileUpdatedHandler } from '@khlug/app/application/user/eventHandler/UserProfileUpdatedHandler';

import {
  ISlackSender,
  SlackSender,
} from '@khlug/app/domain/adapter/ISlackSender';
import { UserProfileUpdated } from '@khlug/app/domain/user/event/UserProfileUpdated';
import { User } from '@khlug/app/domain/user/model/User';

import { generateUser } from '@khlug/__test__/fixtures/domain';

describe('UserProfileUpdatedHandler', () => {
  let handler: UserProfileUpdatedHandler;
  let slackSender: jest.Mocked<ISlackSender>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        UserProfileUpdatedHandler,
        { provide: SlackSender, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(UserProfileUpdatedHandler);
    slackSender = testModule.get(SlackSender);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    let user: User;
    let event: UserProfileUpdated;

    beforeEach(() => {
      user = generateUser();
      event = new UserProfileUpdated(user);

      slackSender.send = jest.fn();
    });

    test('유저 자신에게 슬랙 메시지를 보내야 한다', () => {
      handler.handle(event);

      expect(slackSender.send).toBeCalledTimes(1);
      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: user.id }),
      );
    });
  });
});
