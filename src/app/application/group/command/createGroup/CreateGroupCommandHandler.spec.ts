import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { CreateGroupCommandHandler } from '@sight/app/application/group/command/createGroup/CreateGroupCommandHandler';

import { GroupFactory } from '@sight/app/domain/group/GroupFactory';
import { GroupMemberFactory } from '@sight/app/domain/group/GroupMemberFactory';
import { GroupInterestFactory } from '@sight/app/domain/interest/GroupInterestFactory';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';
import {
  GroupRepository,
  IGroupRepository,
} from '@sight/app/domain/group/IGroupRepository';
import {
  GroupInterestRepository,
  IGroupInterestRepository,
} from '@sight/app/domain/interest/IGroupInterestRepository';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';

import { generateEmptyProviders } from '@sight/__test__/util';
import { CreateGroupCommand } from './CreateGroupCommand';
import {
  GroupAccessGrade,
  GroupCategory,
} from '@sight/app/domain/group/model/constant';
import { DomainFixture } from '@sight/__test__/fixtures';
import { Message } from '@sight/constant/message';
import { Group } from '@sight/app/domain/group/model/Group';
import { GroupMember } from '@sight/app/domain/group/model/GroupMember';
import { GroupInterest } from '@sight/app/domain/interest/model/GroupInterest';

describe('CreateGroupCommandHandler', () => {
  let handler: CreateGroupCommandHandler;
  let groupFactory: jest.Mocked<GroupFactory>;
  let groupMemberFactory: jest.Mocked<GroupMemberFactory>;
  let groupInterestFactory: jest.Mocked<GroupInterestFactory>;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let groupInterestRepository: jest.Mocked<IGroupInterestRepository>;
  let interestRepository: jest.Mocked<IInterestRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        CreateGroupCommandHandler,
        ...generateEmptyProviders(
          GroupFactory,
          GroupMemberFactory,
          GroupInterestFactory,
          GroupRepository,
          GroupMemberRepository,
          GroupInterestRepository,
          InterestRepository,
        ),
      ],
    }).compile();

    handler = testModule.get(CreateGroupCommandHandler);
    groupFactory = testModule.get(GroupFactory);
    groupMemberFactory = testModule.get(GroupMemberFactory);
    groupInterestFactory = testModule.get(GroupInterestFactory);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    groupInterestRepository = testModule.get(GroupInterestRepository);
    interestRepository = testModule.get(InterestRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let command: CreateGroupCommand;
    let newGroup: Group;
    let groupMember: GroupMember;
    let groupInterest: GroupInterest;

    const userId = 'userId';
    const title = 'title';
    const category = GroupCategory.DOCUMENTATION;
    const grade = GroupAccessGrade.MEMBER;
    const interestIds = ['interestId'];
    const purpose = 'purpose';
    const technology = ['github', 'typescript'];
    const allowJoin = true;
    const repository = 'https://repo.sito.ry';

    beforeEach(() => {
      command = new CreateGroupCommand(
        userId,
        title,
        category,
        grade,
        interestIds,
        purpose,
        technology,
        allowJoin,
        repository,
      );
      newGroup = DomainFixture.generateGroup();
      groupMember = DomainFixture.generateGroupMember({
        groupId: newGroup.id,
        userId: userId,
      });
      groupInterest = DomainFixture.generateGroupInterest({
        groupId: newGroup.id,
      });

      const interests = interestIds.map((interestId) =>
        DomainFixture.generateInterest({ id: interestId }),
      );

      interestRepository.findByIds = jest.fn().mockResolvedValue(interests);
      groupFactory.create = jest.fn().mockReturnValue(newGroup);
      groupRepository.nextId = jest.fn().mockReturnValue(newGroup.id);
      groupMemberFactory.create = jest.fn().mockReturnValue(groupMember);
      groupMemberRepository.nextId = jest.fn().mockReturnValue(groupMember.id);
      groupInterestFactory.create = jest.fn().mockReturnValue(groupInterest);
      groupInterestRepository.nextId = jest
        .fn()
        .mockReturnValue(groupInterest.id);

      groupRepository.save = jest.fn();
      groupMemberRepository.save = jest.fn();
      groupInterestRepository.save = jest.fn();
    });

    test('존재하지 않는 관심사일 때 예외가 발생해야 한다', async () => {
      interestRepository.findByIds = jest.fn().mockResolvedValue([]);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.SOME_INTERESTS_NOT_FOUND,
      );
    });

    test('새로운 그룹을 생성한 뒤 저장해야 한다', async () => {
      await handler.execute(command);

      expect(groupFactory.create).toBeCalledTimes(1);

      expect(groupRepository.save).toBeCalledTimes(1);
      expect(groupRepository.save).toBeCalledWith(newGroup);
    });

    test('새로운 그룹 멤버 정보를 생성한 뒤 저장해야 한다', async () => {
      await handler.execute(command);

      expect(groupMemberFactory.create).toBeCalledTimes(1);

      expect(groupMemberRepository.save).toBeCalledTimes(1);
      expect(groupMemberRepository.save).toBeCalledWith(groupMember);
    });

    test('새로운 그룹 관심사 정보를 중복되지 않게 생성해야 한다', async () => {
      const duplicatedInterestIds = ['some', 'some', 'other'];
      const uniqueInterestIds = Array.from(new Set(duplicatedInterestIds));

      command = {
        ...command,
        interestIds: duplicatedInterestIds,
      };
      interestRepository.findByIds = jest
        .fn()
        .mockResolvedValue(
          uniqueInterestIds.map((interestId) =>
            DomainFixture.generateInterest({ id: interestId }),
          ),
        );

      await handler.execute(command);

      expect(groupInterestFactory.create).toBeCalledTimes(
        uniqueInterestIds.length,
      );
    });

    test('새로운 그룹 관심사 정보를 생성한 뒤 저장해야 한다', async () => {
      await handler.execute(command);

      expect(groupInterestFactory.create).toBeCalledTimes(1);

      expect(groupInterestRepository.save).toBeCalledTimes(1);
      expect(groupInterestRepository.save).toBeCalledWith(groupInterest);
    });
  });
});
