import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { AddBookmarkCommand } from '@sight/app/application/group/command/addBookmark/AddBookmarkCommand';
import { AddBookmarkCommandHandler } from '@sight/app/application/group/command/addBookmark/AddBookmarkCommandHandler';

import { GroupBookmarkFactory } from '@sight/app/domain/group/GroupBookmarkFactory';
import { Group } from '@sight/app/domain/group/model/Group';
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
import { Message } from '@sight/constant/message';

describe('AddBookmarkCommandHandler', () => {
  let handler: AddBookmarkCommandHandler;
  let groupBookmarkFactory: GroupBookmarkFactory;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupBookmarkRepository: jest.Mocked<IGroupBookmarkRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        AddBookmarkCommandHandler,
        GroupBookmarkFactory,
        { provide: GroupRepository, useValue: {} },
        { provide: GroupBookmarkRepository, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(AddBookmarkCommandHandler);
    groupBookmarkFactory = testModule.get(GroupBookmarkFactory);
    groupRepository = testModule.get(GroupRepository);
    groupBookmarkRepository = testModule.get(GroupBookmarkRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let group: Group;

    const newBookmarkId = 'new-bookmark-id';
    const groupId = 'groupId';
    const userId = 'userId';

    beforeEach(() => {
      group = DomainFixture.generateGroup({ id: groupId });

      groupRepository.findById = jest.fn().mockResolvedValue(group);
      groupBookmarkRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);
      groupBookmarkRepository.nextId = jest.fn().mockReturnValue(newBookmarkId);

      groupBookmarkRepository.save = jest.fn();
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

    test('이미 즐겨찾기 중이라면 새로운 즐겨찾기를 생성하지 않아야 한다', async () => {
      const bookmark = DomainFixture.generateGroupBookmark();
      groupBookmarkRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValue(bookmark);
      jest.spyOn(groupBookmarkFactory, 'create');

      await handler.execute(new AddBookmarkCommand(groupId, userId));

      expect(groupBookmarkFactory.create).not.toBeCalled();
    });

    test('즐겨찾기를 생성해야 한다', async () => {
      const expected = groupBookmarkFactory.create({
        id: newBookmarkId,
        groupId,
        userId,
      });

      await handler.execute(new AddBookmarkCommand(groupId, userId));

      expect(groupBookmarkRepository.save).toBeCalledTimes(1);
      expect(groupBookmarkRepository.save).toBeCalledWith(expected);
    });
  });
});
