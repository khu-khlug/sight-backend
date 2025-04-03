import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { MessengerToken } from '@khlug/app/domain/adapter/IMessenger';
import {
  GroupBookmarkRepository,
  IGroupBookmarkRepository,
} from '@khlug/app/domain/group/IGroupBookmarkRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';

import { GroupBookmarkFixture } from '@khlug/__test__/fixtures/GroupBookmarkFixture';
import { GroupFixture } from '@khlug/__test__/fixtures/GroupFixture';
import { Message } from '@khlug/constant/error';

import { RemoveBookmarkCommand } from './RemoveBookmarkCommand';
import { RemoveBookmarkCommandHandler } from './RemoveBookmarkCommandHandler';

describe('RemoveBookmarkCommandHandler', () => {
  let handler: RemoveBookmarkCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupBookmarkRepository: jest.Mocked<IGroupBookmarkRepository>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        RemoveBookmarkCommandHandler,
        {
          provide: GroupRepository,
          useValue: { findById: jest.fn() },
        },
        {
          provide: GroupBookmarkRepository,
          useValue: { findByGroupIdAndUserId: jest.fn(), remove: jest.fn() },
        },
        {
          provide: MessengerToken,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(RemoveBookmarkCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    groupBookmarkRepository = testModule.get(GroupBookmarkRepository);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('그룹이 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const command = new RemoveBookmarkCommand('groupId', 123);

      groupRepository.findById.mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrow(
        Message.GROUP_NOT_FOUND,
      );
    });

    test('대상 그룹이 고객 센터 그룹이라면 예외를 발생시켜야 한다', async () => {
      const command = new RemoveBookmarkCommand('groupId', 123);
      const group = GroupFixture.customerService();

      groupRepository.findById.mockResolvedValue(group);

      await expect(handler.execute(command)).rejects.toThrow(
        Message.DEFAULT_BOOKMARKED_GROUP,
      );
    });

    test('대상 그룹이 실습 그룹이라면 예외를 발생시켜야 한다', async () => {
      const command = new RemoveBookmarkCommand('groupId', 123);
      const group = GroupFixture.practice();

      groupRepository.findById.mockResolvedValue(group);

      await expect(handler.execute(command)).rejects.toThrow(
        Message.DEFAULT_BOOKMARKED_GROUP,
      );
    });

    test('이미 즐겨 찾는 그룹이 아니라면 즐겨찾기를 제거하지 않아야 한다', async () => {
      const command = new RemoveBookmarkCommand('groupId', 123);
      const group = GroupFixture.inProgressJoinable();

      groupRepository.findById.mockResolvedValue(group);
      groupBookmarkRepository.findByGroupIdAndUserId.mockResolvedValue(null);

      await handler.execute(command);

      expect(groupBookmarkRepository.remove).not.toBeCalled();
    });

    test('그룹 즐겨찾기를 제거해야 한다', async () => {
      const command = new RemoveBookmarkCommand('groupId', 123);
      const group = GroupFixture.inProgressJoinable();
      const bookmark = GroupBookmarkFixture.normal();

      groupRepository.findById.mockResolvedValue(group);
      groupBookmarkRepository.findByGroupIdAndUserId.mockResolvedValue(
        bookmark,
      );

      await handler.execute(command);

      expect(groupBookmarkRepository.remove).toBeCalledWith(bookmark);
    });
  });
});
