import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { AddBookmarkCommand } from '@sight/app/application/group/command/addBookmark/AddBookmarkCommand';
import { AddBookmarkCommandHandler } from '@sight/app/application/group/command/addBookmark/AddBookmarkCommandHandler';

import { GroupBookmarkFactory } from '@sight/app/domain/group/GroupBookmarkFactory';
import {
  GroupBookmarkRepository,
  IGroupBookmarkRepository,
} from '@sight/app/domain/group/IGroupBookmarkRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';

import { Message } from '@sight/constant/message';
import { SlackSender } from '@sight/app/domain/adapter/ISlackSender';
import { GroupFixture } from '@sight/__test__/fixtures/GroupFixture';
import { GroupBookmarkFixture } from '@sight/__test__/fixtures/GroupBookmarkFixture';

describe('AddBookmarkCommandHandler', () => {
  let handler: AddBookmarkCommandHandler;
  let groupBookmarkFactory: GroupBookmarkFactory;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupBookmarkRepository: jest.Mocked<IGroupBookmarkRepository>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        AddBookmarkCommandHandler,
        GroupBookmarkFactory,
        {
          provide: GroupRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: GroupBookmarkRepository,
          useValue: {
            findByGroupIdAndUserId: jest.fn(),
            nextId: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: SlackSender,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = testModule.get(AddBookmarkCommandHandler);
    groupBookmarkFactory = testModule.get(GroupBookmarkFactory);
    groupRepository = testModule.get(GroupRepository);
    groupBookmarkRepository = testModule.get(GroupBookmarkRepository);
  });

  afterEach(() => clear());

  describe('execute', () => {
    const groupId = 'groupId';
    const userId = 'userId';

    test('그룹이 존재하지 않으면 예외가 발생해야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        handler.execute(new AddBookmarkCommand(groupId, userId)),
      ).rejects.toThrowError(Message.GROUP_NOT_FOUND);
    });

    test('고객 센터 그룹이라면 예외가 발생해야 한다', async () => {
      const customerServiceGroup = GroupFixture.customerService();
      groupRepository.findById.mockResolvedValue(customerServiceGroup);

      await expect(
        handler.execute(new AddBookmarkCommand(groupId, userId)),
      ).rejects.toThrowError(Message.DEFAULT_BOOKMARKED_GROUP);
    });

    test('그룹 활용 실습 그룹이라면 예외가 발생해야 한다', async () => {
      const practiceGroup = GroupFixture.practice();
      groupRepository.findById.mockResolvedValue(practiceGroup);

      await expect(
        handler.execute(new AddBookmarkCommand(groupId, userId)),
      ).rejects.toThrowError(Message.DEFAULT_BOOKMARKED_GROUP);
    });

    test('이미 즐겨찾기 중이라면 새로운 즐겨찾기를 생성하지 않아야 한다', async () => {
      const group = GroupFixture.inProgressJoinable();
      const bookmark = GroupBookmarkFixture.normal();

      groupRepository.findById.mockResolvedValue(group);
      groupBookmarkRepository.findByGroupIdAndUserId.mockResolvedValue(
        bookmark,
      );
      jest.spyOn(groupBookmarkFactory, 'create');

      await handler.execute(new AddBookmarkCommand(groupId, userId));

      expect(groupBookmarkFactory.create).not.toBeCalled();
    });

    test('즐겨찾기를 생성해야 한다', async () => {
      const group = GroupFixture.inProgressJoinable();
      const newBookmarkId = 'new-bookmark-id';

      groupRepository.findById.mockResolvedValue(group);
      groupBookmarkRepository.nextId.mockReturnValue(newBookmarkId);

      const expected = groupBookmarkFactory.create({
        id: newBookmarkId,
        groupId,
        userId,
      });

      await handler.execute(new AddBookmarkCommand(groupId, userId));

      expect(groupBookmarkRepository.save).toBeCalledWith(expected);
    });
  });
});
