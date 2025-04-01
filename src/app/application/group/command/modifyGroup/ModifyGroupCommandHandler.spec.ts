import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import {
  GroupLogger,
  IGroupLogger,
} from '@khlug/app/domain/group/IGroupLogger';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@khlug/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@khlug/app/domain/group/IGroupRepository';
import {
  GroupAccessGrade,
  GroupCategory,
} from '@khlug/app/domain/group/model/constant';
import {
  IInterestRepository,
  InterestRepository,
} from '@khlug/app/domain/interest/IInterestRepository';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { GroupFixture } from '@khlug/__test__/fixtures/GroupFixture';
import { Message } from '@khlug/constant/error';

import { ModifyGroupCommand } from './ModifyGroupCommand';
import { ModifyGroupCommandHandler } from './ModifyGroupCommandHandler';

describe('ModifyGroupCommandHandler', () => {
  let handler: ModifyGroupCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let interestRepository: jest.Mocked<IInterestRepository>;
  let groupLogger: jest.Mocked<IGroupLogger>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        ModifyGroupCommandHandler,
        {
          provide: GroupRepository,
          useValue: { findById: jest.fn(), save: jest.fn() },
        },
        {
          provide: GroupMemberRepository,
          useValue: { findByGroupIdAndUserId: jest.fn() },
        },
        {
          provide: InterestRepository,
          useValue: { findByIds: jest.fn() },
        },
        {
          provide: GroupLogger,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(ModifyGroupCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    interestRepository = testModule.get(InterestRepository);
    groupLogger = testModule.get(GroupLogger);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('그룹이 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById.mockResolvedValue(null);

      const command = new ModifyGroupCommand('groupId', 123, {
        category: GroupCategory.DOCUMENTATION,
        title: 'title',
        purpose: 'purpose',
        interestIds: [],
        technology: [],
        grade: 'grade',
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.GROUP_NOT_FOUND,
      );
    });

    test('요청자가 그룹장이 아니라면 예외를 발생시켜야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({
        category: GroupCategory.DOCUMENTATION,
      });
      const notAdminUserId = 124;

      groupRepository.findById.mockResolvedValue(group);

      const command = new ModifyGroupCommand(group.id, notAdminUserId, {
        category: GroupCategory.DOCUMENTATION,
        title: 'title',
        purpose: 'purpose',
        interestIds: [],
        technology: [],
        grade: 'grade',
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP,
      );
    });

    test('요청자가 그룹에 속해있지 않다면 예외를 발생시켜야 한다', async () => {
      // 운영 그룹은 그룹장 확인을 스킵하기 때문에, 그룹장 여부를 통과하더라도
      // 그룹에 속해있지 않은 경우를 확인해야 한다.

      const group = GroupFixture.inProgressJoinable({
        category: GroupCategory.MANAGE,
      });
      const notAdminUserId = 124;

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId.mockResolvedValue(null);

      const command = new ModifyGroupCommand(group.id, notAdminUserId, {
        category: GroupCategory.MANAGE,
        title: 'title',
        purpose: 'purpose',
        interestIds: [],
        technology: [],
        grade: 'grade',
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.REQUESTER_NOT_JOINED_GROUP,
      );
    });

    test('수정할 수 없는 그룹이라면 예외를 발생시켜야 한다', async () => {
      const group = GroupFixture.inProgressJoinable();
      const groupMember = DomainFixture.generateGroupMember();

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId.mockResolvedValue(
        groupMember,
      );
      jest.spyOn(group, 'isEditable').mockReturnValue(false);

      const command = new ModifyGroupCommand(group.id, group.adminUserId, {
        category: GroupCategory.MANAGE,
        title: 'title',
        purpose: 'purpose',
        interestIds: [],
        technology: [],
        grade: 'grade',
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.GROUP_NOT_EDITABLE,
      );
    });

    test('수정하려는 관심사가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const group = GroupFixture.inProgressJoinable();
      const groupMember = DomainFixture.generateGroupMember();

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId.mockResolvedValue(
        groupMember,
      );
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(group, 'isEditable').mockReturnValue(true);

      const command = new ModifyGroupCommand(group.id, group.adminUserId, {
        category: GroupCategory.MANAGE,
        title: 'title',
        purpose: 'purpose',
        interestIds: ['interestId'],
        technology: [],
        grade: 'grade',
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.SOME_INTERESTS_NOT_FOUND,
      );
    });

    test('변경된 항목이 없다면 그룹을 수정하지 않고 반환해야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({ interestIds: [] });
      const groupMember = DomainFixture.generateGroupMember();

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId.mockResolvedValue(
        groupMember,
      );
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(group, 'isEditable').mockReturnValue(true);

      const command = new ModifyGroupCommand(group.id, group.adminUserId, {
        category: group.category,
        title: group.title,
        purpose: group.purpose,
        interestIds: group.interestIds,
        technology: group.technology,
        grade: group.grade,
        repository: group.repository,
        allowJoin: group.allowJoin,
      });
      await handler.execute(command);

      expect(groupRepository.save).not.toHaveBeenCalled();
    });

    test('그룹 정보를 수정해야 한다', async () => {
      const group = GroupFixture.inProgressJoinable({
        category: GroupCategory.EDUCATION,
        title: 'oldTitle',
        purpose: 'oldPurpose',
        interestIds: ['oldInterestId'],
        technology: ['oldTechnology'],
        grade: GroupAccessGrade.MEMBER,
        repository: 'https://old.repo.sitory',
        allowJoin: false,
      });
      const groupMember = DomainFixture.generateGroupMember();

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId.mockResolvedValue(
        groupMember,
      );
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(group, 'isEditable').mockReturnValue(true);

      const command = new ModifyGroupCommand(group.id, group.adminUserId, {
        category: GroupCategory.DOCUMENTATION,
        title: 'title',
        purpose: 'purpose',
        interestIds: [],
        technology: ['technology'],
        grade: GroupAccessGrade.PRIVATE,
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await handler.execute(command);

      expect(group.category).toEqual(GroupCategory.DOCUMENTATION);
      expect(group.title).toEqual('title');
      expect(group.purpose).toEqual('purpose');
      expect(group.interestIds).toEqual([]);
      expect(group.technology).toEqual(['technology']);
      expect(group.grade).toEqual(GroupAccessGrade.PRIVATE);
      expect(group.repository).toEqual('https://repo.sitory');
      expect(group.allowJoin).toEqual(true);
    });

    test('그룹 로그가 생성되어야 한다', async () => {
      const group = GroupFixture.inProgressJoinable();
      const groupMember = DomainFixture.generateGroupMember();

      groupRepository.findById.mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId.mockResolvedValue(
        groupMember,
      );
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(group, 'isEditable').mockReturnValue(true);

      const command = new ModifyGroupCommand(group.id, group.adminUserId, {
        category: GroupCategory.DOCUMENTATION,
        title: 'title',
        purpose: 'purpose',
        interestIds: [],
        technology: [],
        grade: 'grade',
        repository: 'https://repo.sitory',
        allowJoin: true,
      });
      await handler.execute(command);

      expect(groupLogger.log).toBeCalled();
    });
  });
});
