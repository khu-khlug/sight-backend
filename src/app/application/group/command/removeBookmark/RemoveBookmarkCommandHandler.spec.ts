import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { AddBookmarkCommand } from '@sight/app/application/group/command/addBookmark/AddBookmarkCommand';
import { RemoveBookmarkCommandHandler } from '@sight/app/application/group/command/removeBookmark/RemoveBookmarkCommandHandler';

import {
  GroupBookmarkRepository,
  IGroupBookmarkRepository,
} from '@sight/app/domain/group/IGroupBookmarkRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  CUSTOMER_SERVICE_GROUP_ID,
  PRACTICE_GROUP_ID,
} from '@sight/app/domain/group/model/constant';

import { DomainFixture } from '@sight/__test__/fixtures';
import { generateEmptyProviders } from '@sight/__test__/util';
import { Message } from '@sight/constant/message';

describe('RemoveBookmarkCommandHandler', () => {
  let handler: RemoveBookmarkCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupBookmarkRepository: jest.Mocked<IGroupBookmarkRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        RemoveBookmarkCommandHandler,
        ...generateEmptyProviders(GroupRepository, GroupBookmarkRepository),
      ],
    }).compile();

    handler = testModule.get(RemoveBookmarkCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    groupBookmarkRepository = testModule.get(GroupBookmarkRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    const groupId = 'groupId';
    const userId = 'userId';

    beforeEach(() => {
      const group = DomainFixture.generateGroup();
      const groupBookmark = DomainFixture.generateGroupBookmark();

      groupRepository.findById = jest.fn().mockResolvedValue(group);
      groupBookmarkRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValue(groupBookmark);

      groupBookmarkRepository.remove = jest.fn();
    });

    test('그룹이 존재하지 않으면 예외가 발생해야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        handler.execute(new AddBookmarkCommand(groupId, userId)),
      ).rejects.toThrowError(Message.GROUP_NOT_FOUND);
    });

    test('고객 센터 그룹이라면 예외가 발생해야 한다', async () => {
      const customerServiceGroup = DomainFixture.generateGroup({
        id: CUSTOMER_SERVICE_GROUP_ID,
      });
      groupRepository.findById = jest
        .fn()
        .mockResolvedValue(customerServiceGroup);

      await expect(
        handler.execute(new AddBookmarkCommand(groupId, userId)),
      ).rejects.toThrowError(Message.DEFAULT_BOOKMARKED_GROUP);
    });

    test('그룹 활용 실습 그룹이라면 예외가 발생해야 한다', async () => {
      const practiceGroup = DomainFixture.generateGroup({
        id: PRACTICE_GROUP_ID,
      });
      groupRepository.findById = jest.fn().mockResolvedValue(practiceGroup);

      await expect(
        handler.execute(new AddBookmarkCommand(groupId, userId)),
      ).rejects.toThrowError(Message.DEFAULT_BOOKMARKED_GROUP);
    });

    test('아직 그룹을 즐겨찾기하지 않았다면 무시해야 한다', async () => {
      groupBookmarkRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await handler.execute(new AddBookmarkCommand(groupId, userId));

      expect(groupBookmarkRepository.remove).not.toBeCalled();
    });

    test('그룹을 즐겨찾기 해제해야 한다', async () => {
      await handler.execute(new AddBookmarkCommand(groupId, userId));

      expect(groupBookmarkRepository.remove).toBeCalled();
    });
  });
});
