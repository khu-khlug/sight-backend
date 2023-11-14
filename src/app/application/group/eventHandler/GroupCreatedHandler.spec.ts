import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupCreatedHandler } from '@sight/app/application/group/eventHandler/GroupCreatedHandler';

import { GroupCreated } from '@sight/app/domain/group/event/GroupCreated';
import { Group } from '@sight/app/domain/group/model/Group';
import { User } from '@sight/app/domain/user/model/User';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { Message } from '@sight/constant/message';
import { Point } from '@sight/constant/point';

describe('GroupCreatedHandler', () => {
  let handler: GroupCreatedHandler;
  let slackSender: jest.Mocked<ISlackSender>;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupCreatedHandler,
        { provide: SlackSender, useValue: {} },
        { provide: UserRepository, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(GroupCreatedHandler);
    slackSender = testModule.get(SlackSender);
    userRepository = testModule.get(UserRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    let group: Group;
    let event: GroupCreated;
    let authorUser: User;

    beforeEach(() => {
      authorUser = DomainFixture.generateUser();
      group = DomainFixture.generateGroup({ authorUserId: authorUser.id });
      event = new GroupCreated(group);

      userRepository.findById = jest.fn().mockResolvedValue(authorUser);

      userRepository.save = jest.fn();
      slackSender.send = jest.fn();

      jest.spyOn(authorUser, 'grantPoint');
    });

    test('그룹 생성자가 존재하지 않으면 예외가 발생해야 한다', async () => {
      userRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(handler.handle(event)).rejects.toThrowError(
        Message.USER_NOT_FOUND,
      );
    });

    test('그룹 생성자에게 포인트를 부여해줘야 한다', async () => {
      await handler.handle(event);

      expect(authorUser.grantPoint).toBeCalledTimes(1);
      expect(authorUser.grantPoint).toBeCalledWith(
        Point.GROUP_CREATED,
        expect.any(String),
      );
    });

    test('슬랙 메시지를 보내야 한다', async () => {
      await handler.handle(event);

      expect(slackSender.send).toBeCalledTimes(1);
    });
  });
});
