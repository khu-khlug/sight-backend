import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { MessageBuilder } from '@sight/core/message/MessageBuilder';

import { GroupMemberCreatedHandler } from '@sight/app/application/group/eventHandler/GroupMemberCreatedHandler';

import { GroupMemberCreated } from '@sight/app/domain/group/event/GroupMemberCreated';
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
  GroupAccessGrade,
  PRACTICE_GROUP_ID,
} from '@sight/app/domain/group/model/constant';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { generateEmptyProviders } from '@sight/__test__/util';

describe('GroupMemberCreatedHandler', () => {
  let handler: GroupMemberCreatedHandler;
  let groupLogger: jest.Mocked<IGroupLogger>;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let slackSender: jest.Mocked<ISlackSender>;
  let messageBuilder: jest.Mocked<MessageBuilder>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupMemberCreatedHandler,
        ...generateEmptyProviders(
          GroupLogger,
          GroupRepository,
          GroupMemberRepository,
          UserRepository,
          SlackSender,
          MessageBuilder,
        ),
      ],
    }).compile();

    handler = testModule.get(GroupMemberCreatedHandler);
    groupLogger = testModule.get(GroupLogger);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    userRepository = testModule.get(UserRepository);
    slackSender = testModule.get(SlackSender);
    messageBuilder = testModule.get(MessageBuilder);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    const groupId = 'groupId';
    const userId = 'userId';

    beforeEach(() => {
      groupRepository.findById = jest.fn();
      userRepository.findById = jest.fn();
      groupLogger.log = jest.fn();
      slackSender.send = jest.fn();
      userRepository.save = jest.fn();
      groupRepository.save = jest.fn();

      messageBuilder.build = jest.fn().mockReturnValue('message');
      groupMemberRepository.findByGroupId = jest.fn().mockResolvedValue([]);
    });

    test('그룹이 존재하지 않으면 메시지를 보내지 않아야 한다', async () => {
      const group = null;

      groupRepository.findById.mockResolvedValue(group);

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(slackSender.send).not.toBeCalled();
    });

    test('유저가 존재하지 않으면 메시지를 보내지 않아야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = null;

      groupRepository.findById.mockResolvedValue(group);
      userRepository.findById.mockResolvedValue(user);

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(slackSender.send).not.toBeCalled();
    });

    test('그룹 로그를 생성해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser();

      groupRepository.findById.mockResolvedValue(group);
      userRepository.findById.mockResolvedValue(user);

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(groupLogger.log).toBeCalledTimes(1);
    });

    test('그룹에 참여한 유저에게 메시지를 보내야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser({ id: userId });

      groupRepository.findById.mockResolvedValue(group);
      userRepository.findById.mockResolvedValue(user);

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: userId }),
      );
    });

    test('운영진 공개 그룹이라면 그룹의 모든 멤버에게 메시지를 보내야 한다', async () => {
      const managerGroup = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MANAGER,
      });
      const user = DomainFixture.generateUser({ id: userId });
      const groupMembers = [
        DomainFixture.generateGroupMember({ userId: 'groupMember1' }),
        DomainFixture.generateGroupMember({ userId: 'groupMember2' }),
        DomainFixture.generateGroupMember({ userId: 'groupMember3' }),
      ];

      groupRepository.findById.mockResolvedValue(managerGroup);
      userRepository.findById.mockResolvedValue(user);
      groupMemberRepository.findByGroupId.mockResolvedValue(groupMembers);

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: groupMembers[0].userId }),
      );
      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: groupMembers[1].userId }),
      );
      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: groupMembers[2].userId }),
      );
    });

    test('운영진 공개 그룹이 아니라면 그룹장에게 메시지를 보내야 한다', async () => {
      const group = DomainFixture.generateGroup({ adminUserId: 'adminUserId' });
      const user = DomainFixture.generateUser({ id: userId });

      groupRepository.findById.mockResolvedValue(group);
      userRepository.findById.mockResolvedValue(user);

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: group.adminUserId }),
      );
    });

    test('참가한 그룹이 그룹 활용 실습 그룹이라면 경험치를 부여하지 않아야 한다', async () => {
      const practiceGroup = DomainFixture.generateGroup({
        id: PRACTICE_GROUP_ID,
      });
      const user = DomainFixture.generateUser({ id: userId });

      groupRepository.findById.mockResolvedValue(practiceGroup);
      userRepository.findById.mockResolvedValue(user);
      jest.spyOn(user, 'grantPoint');

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(user.grantPoint).not.toBeCalled();
    });

    test('참가한 그룹이 그룹 활용 실습 그룹이 아니라면 경험치를 부여해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser({ id: userId });

      groupRepository.findById.mockResolvedValue(group);
      userRepository.findById.mockResolvedValue(user);
      jest.spyOn(user, 'grantPoint');

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(user.grantPoint).toBeCalledTimes(1);
    });

    test('그룹을 깨워야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser({ id: userId });

      groupRepository.findById.mockResolvedValue(group);
      userRepository.findById.mockResolvedValue(user);
      jest.spyOn(group, 'wake');

      await handler.handle(new GroupMemberCreated(groupId, userId));

      expect(group.wake).toBeCalledTimes(1);
    });
  });
});
