import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';
import { ClsService } from 'nestjs-cls';

import { IRequester } from '@sight/core/auth/IRequester';
import { UserRole } from '@sight/core/auth/UserRole';
import { MessageBuilder } from '@sight/core/message/MessageBuilder';

import { GroupPortfolioDisabledHandler } from '@sight/app/application/group/eventHandler/GroupPortfolioDisabledHandler';

import { PRACTICE_GROUP_ID } from '@sight/app/domain/group/model/constant';
import { Group } from '@sight/app/domain/group/model/Group';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupLogger,
  IGroupLogger,
} from '@sight/app/domain/group/IGroupLogger';
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

import { DomainFixture } from '@sight/__test__/fixtures';
import { Point } from '@sight/constant/point';

describe('GroupPortfolioDisabledHandler', () => {
  let handler: GroupPortfolioDisabledHandler;
  let messageBuilder: MessageBuilder;
  let clsService: jest.Mocked<ClsService>;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let groupLogger: jest.Mocked<IGroupLogger>;
  let slackSender: jest.Mocked<ISlackSender>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupPortfolioDisabledHandler,
        MessageBuilder,
        { provide: ClsService, useValue: {} },
        { provide: GroupRepository, useValue: {} },
        { provide: GroupMemberRepository, useValue: {} },
        { provide: UserRepository, useValue: {} },
        { provide: GroupLogger, useValue: {} },
        { provide: SlackSender, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(GroupPortfolioDisabledHandler);
    messageBuilder = testModule.get(MessageBuilder);
    clsService = testModule.get(ClsService);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    userRepository = testModule.get(UserRepository);
    groupLogger = testModule.get(GroupLogger);
    slackSender = testModule.get(SlackSender);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    let group: Group;

    const groupId = 'groupId';
    const requester: IRequester = {
      userId: 'requesterUserId',
      role: UserRole.USER,
    };

    beforeEach(() => {
      group = DomainFixture.generateGroup();

      clsService.get = jest.fn().mockReturnValue(requester);
      groupRepository.findById = jest.fn().mockResolvedValue(group);
      groupMemberRepository.findByGroupId = jest.fn().mockResolvedValue([]);
      userRepository.findByIds = jest.fn().mockResolvedValue([]);

      jest.spyOn(messageBuilder, 'build');
      groupLogger.log = jest.fn();
      userRepository.save = jest.fn();
      slackSender.send = jest.fn();
    });

    test('그룹이 존재하지 않으면 아무 동작도 하지 않아야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      await handler.handle({ groupId });

      expect(groupRepository.findById).toBeCalledWith(groupId);
    });

    test('그룹 로그를 남겨야 한다', async () => {
      await handler.handle({ groupId });

      expect(groupLogger.log).toBeCalledTimes(1);
    });

    test('모든 그룹 멤버들에게서 포인트를 회수해야 한다', async () => {
      const user = DomainFixture.generateUser();
      const groupMember = DomainFixture.generateGroupMember({
        userId: user.id,
      });

      groupMemberRepository.findByGroupId = jest
        .fn()
        .mockResolvedValue([groupMember]);
      userRepository.findByIds = jest.fn().mockResolvedValue([user]);
      jest.spyOn(user, 'grantPoint');

      await handler.handle({ groupId });

      expect(user.grantPoint).toBeCalledTimes(1);
      expect(user.grantPoint).toBeCalledWith(
        -Point.GROUP_ENABLED_PORTFOLIO,
        expect.any(String),
      );

      expect(userRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith(user);
    });

    test('그룹 활용 실습 그룹이면 포인트를 회수하지 않아야 한다', async () => {
      const practiceGroup = DomainFixture.generateGroup({
        id: PRACTICE_GROUP_ID,
      });
      groupRepository.findById = jest.fn().mockResolvedValue(practiceGroup);

      await handler.handle({ groupId });

      expect(userRepository.save).not.toBeCalled();
    });

    test('메시지를 보내야 한다', async () => {
      await handler.handle({ groupId });

      expect(slackSender.send).toBeCalledTimes(1);
    });
  });
});
