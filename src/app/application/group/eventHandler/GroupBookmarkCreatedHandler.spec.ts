import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';
import { ClsService } from 'nestjs-cls';

import { IRequester } from '@sight/core/auth/IRequester';
import { UserRole } from '@sight/core/auth/UserRole';
import { MessageBuilder } from '@sight/core/message/MessageBuilder';

import { GroupBookmarkCreatedHandler } from '@sight/app/application/group/eventHandler/GroupBookmarkCreatedHandler';

import { GroupBookmarkCreated } from '@sight/app/domain/group/event/GroupBookmarkCreated';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { generateEmptyProviders } from '@sight/__test__/util';

describe('GroupBookmarkCreatedHandler', () => {
  let handler: GroupBookmarkCreatedHandler;
  let clsService: jest.Mocked<ClsService>;
  let messageBuilder: jest.Mocked<MessageBuilder>;
  let slackSender: jest.Mocked<ISlackSender>;
  let groupRepository: jest.Mocked<IGroupRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupBookmarkCreatedHandler,
        ...generateEmptyProviders(
          ClsService,
          MessageBuilder,
          SlackSender,
          GroupRepository,
        ),
      ],
    }).compile();

    handler = testModule.get(GroupBookmarkCreatedHandler);
    clsService = testModule.get(ClsService);
    messageBuilder = testModule.get(MessageBuilder);
    slackSender = testModule.get(SlackSender);
    groupRepository = testModule.get(GroupRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    const requesterUserId = 'requesterUserId';

    beforeEach(() => {
      const requester: IRequester = {
        userId: requesterUserId,
        role: UserRole.USER,
      };
      const group = DomainFixture.generateGroup();

      clsService.get = jest.fn().mockReturnValue(requester);
      groupRepository.findById = jest.fn().mockResolvedValue(group);
      messageBuilder.build = jest.fn().mockReturnValue('message');

      slackSender.send = jest.fn();
    });

    test('그룹이 존재하지 않으면 메시지를 보내지 않아야 한다', async () => {
      const groupId = 'groupId';
      const event = new GroupBookmarkCreated(groupId);

      groupRepository.findById.mockResolvedValue(null);

      await handler.handle(event);

      expect(slackSender.send).not.toBeCalled();
    });

    test('요청자에게 메시지를 보내야 한다', async () => {
      const groupId = 'groupId';
      const event = new GroupBookmarkCreated(groupId);

      await handler.handle(event);

      expect(slackSender.send).toBeCalledTimes(1);
      expect(slackSender.send).toBeCalledWith(
        expect.objectContaining({ targetUserId: requesterUserId }),
      );
    });
  });
});
