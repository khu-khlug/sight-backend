import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupUpdatedHandler } from '@sight/app/application/group/eventHandler/GroupUpdatedHandler';

import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  GroupUpdatedMessageBuilder,
  IGroupUpdatedMessageBuilder,
} from '@sight/app/domain/group/messageBuilder/IGroupUpdatedMessageBuilder';

import { generateEmptyProviders } from '@sight/__test__/util';
import {
  GroupUpdated,
  GroupUpdatedItem,
} from '@sight/app/domain/group/event/GroupUpdated';
import { DomainFixture } from '@sight/__test__/fixtures';
import { GroupMember } from '@sight/app/domain/group/model/GroupMember';
import {
  GroupLogger,
  IGroupLogger,
} from '@sight/app/domain/group/IGroupLogger';

describe('GroupUpdatedHandler', () => {
  let handler: GroupUpdatedHandler;
  let groupLogger: jest.Mocked<IGroupLogger>;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let messageBuilder: jest.Mocked<IGroupUpdatedMessageBuilder>;
  let slackSender: jest.Mocked<ISlackSender>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupUpdatedHandler,
        ...generateEmptyProviders(
          GroupLogger,
          GroupRepository,
          GroupMemberRepository,
          GroupUpdatedMessageBuilder,
          SlackSender,
        ),
      ],
    }).compile();

    handler = testModule.get(GroupUpdatedHandler);
    groupLogger = testModule.get(GroupLogger);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    messageBuilder = testModule.get(GroupUpdatedMessageBuilder);
    slackSender = testModule.get(SlackSender);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    let event: GroupUpdated;
    let groupMembers: GroupMember[];

    const groupId = 'groupId';
    const updatedItem: GroupUpdatedItem = 'title';
    const message = 'message';
    const groupAdminUserId = 'group-admin-user-id';

    beforeEach(() => {
      event = new GroupUpdated(groupId, updatedItem);
      groupMembers = [
        DomainFixture.generateGroupMember({ groupId }),
        DomainFixture.generateGroupMember({ groupId }),
      ];
      const group = DomainFixture.generateGroup({
        id: groupId,
        adminUserId: groupAdminUserId,
      });

      groupRepository.findById = jest.fn().mockResolvedValue(group);
      messageBuilder.build = jest.fn().mockReturnValue(message);
      groupMemberRepository.findByGroupId = jest
        .fn()
        .mockResolvedValue(groupMembers);

      groupLogger.log = jest.fn();
      slackSender.send = jest.fn();
    });

    test('그룹이 존재하지 않으면 로그를 생성하지 않아야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      await handler.handle(event);

      expect(groupLogger.log).not.toBeCalled();
    });

    test('로그를 생성하여 저장해야 한다', async () => {
      await handler.handle(event);

      expect(groupLogger.log).toBeCalledTimes(1);
    });

    test('모든 그룹 멤버들에게 메시지를 보내야 한다', async () => {
      await handler.handle(event);

      expect(slackSender.send).toBeCalledTimes(groupMembers.length);
    });
  });
});
