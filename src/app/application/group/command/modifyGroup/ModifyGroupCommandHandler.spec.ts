import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { ModifyGroupCommandHandler } from '@sight/app/application/group/command/modifyGroup/ModifyGroupCommandHandler';
import { ModifyGroupCommandResult } from '@sight/app/application/group/command/modifyGroup/ModifyGroupCommandResult';
import {
  ModifyGroupCommand,
  ModifyGroupParams,
} from '@sight/app/application/group/command/modifyGroup/ModifyGroupCommand';

import { Group } from '@sight/app/domain/group/model/Group';
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
  GroupCategory,
} from '@sight/app/domain/group/model/constant';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { Message } from '@sight/constant/message';

describe('ModifyGroupCommandHandler', () => {
  let handler: ModifyGroupCommandHandler;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let interestRepository: jest.Mocked<IInterestRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        ModifyGroupCommandHandler,
        { provide: GroupRepository, useValue: {} },
        { provide: GroupMemberRepository, useValue: {} },
        { provide: InterestRepository, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(ModifyGroupCommandHandler);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    interestRepository = testModule.get(InterestRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let command: ModifyGroupCommand;
    let group: Group;

    const groupId = 'groupId';
    const requesterUserId = 'requesterUserId';
    const params: ModifyGroupParams = {
      title: 'new-title',
      purpose: 'new-purpose',
      interestIds: ['new', 'interest', 'ids'],
      technology: ['new', 'technology'],
      grade: GroupAccessGrade.MEMBER,
      repository: 'https://new.reposi/tory',
      allowJoin: false,
      category: GroupCategory.STUDY,
    };

    beforeEach(() => {
      command = new ModifyGroupCommand(groupId, requesterUserId, params);
      group = DomainFixture.generateGroup({
        category: GroupCategory.STUDY,
        adminUserId: requesterUserId,
      });
      const groupMember = DomainFixture.generateGroupMember();
      const interests = params.interestIds.map((interestId) =>
        DomainFixture.generateInterest({ id: interestId }),
      );

      groupRepository.findById = jest.fn().mockResolvedValue(group);
      groupMemberRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValue(groupMember);
      interestRepository.findByIds = jest.fn().mockResolvedValue(interests);
      group.isEditable = jest.fn().mockReturnValue(true);

      groupRepository.save = jest.fn();
    });

    test('그룹이 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      groupRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.GROUP_NOT_FOUND,
      );
    });

    test('요청자가 그룹의 관리자가 아니라면 예외를 발생시켜야 한다', async () => {
      const otherUserId = 'other-user-id';
      const commandWithOtherRequester = new ModifyGroupCommand(
        groupId,
        otherUserId,
        params,
      );

      await expect(
        handler.execute(commandWithOtherRequester),
      ).rejects.toThrowError(Message.ONLY_GROUP_ADMIN_CAN_EDIT_GROUP);
    });

    test('운영 그룹은 요청자가 그룹의 관리자가 아니더라도 예외를 발생시키지 않는다', async () => {
      const manageGroup = DomainFixture.generateGroup({
        category: GroupCategory.MANAGE,
      });
      groupRepository.findById = jest.fn().mockResolvedValue(manageGroup);

      const otherUserId = 'other-user-id';
      const commandWithOtherRequester = new ModifyGroupCommand(
        groupId,
        otherUserId,
        params,
      );

      await expect(
        handler.execute(commandWithOtherRequester),
      ).resolves.not.toThrow();
    });

    test('요청자가 그룹에 속하지 않았다면 예외를 발생시켜야 한다', async () => {
      groupMemberRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.REQUESTER_NOT_JOINED_GROUP,
      );
    });

    test('수정할 수 없는 그룹을 수정하면 예외를 발생시켜야 한다', async () => {
      jest.spyOn(group, 'isEditable').mockReturnValue(false);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.GROUP_NOT_EDITABLE,
      );
    });

    test('변경할 관심사가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      interestRepository.findByIds = jest.fn().mockResolvedValue([]);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.SOME_INTERESTS_NOT_FOUND,
      );
    });

    test('변경한 그룹을 저장해야 한다', async () => {
      await handler.execute(command);

      expect(groupRepository.save).toBeCalledTimes(1);
      expect(groupRepository.save).toBeCalledWith(group);
    });

    test('변경한 그룹을 반환해야 한다', async () => {
      const expected = new ModifyGroupCommandResult(group);

      const result = await handler.execute(command);

      expect(result).toEqual(expected);
    });
  });
});
