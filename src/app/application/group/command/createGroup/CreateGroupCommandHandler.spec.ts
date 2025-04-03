import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { CreateGroupCommand } from '@khlug/app/application/group/command/createGroup/CreateGroupCommand';
import { CreateGroupCommandHandler } from '@khlug/app/application/group/command/createGroup/CreateGroupCommandHandler';

import { MessengerToken } from '@khlug/app/domain/adapter/IMessenger';
import { GroupFactory } from '@khlug/app/domain/group/GroupFactory';
import { GroupMemberFactory } from '@khlug/app/domain/group/GroupMemberFactory';
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
import { PointGrantService } from '@khlug/app/domain/user/service/PointGrantService';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { GroupFixture } from '@khlug/__test__/fixtures/GroupFixture';
import { Message } from '@khlug/constant/error';
import { Point } from '@khlug/constant/point';

describe('CreateGroupCommandHandler', () => {
  let handler: CreateGroupCommandHandler;
  let groupFactory: GroupFactory;
  let groupMemberFactory: GroupMemberFactory;
  let pointGrantService: jest.Mocked<PointGrantService>;
  let groupRepository: jest.Mocked<IGroupRepository>;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let interestRepository: jest.Mocked<IInterestRepository>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        CreateGroupCommandHandler,
        GroupFactory,
        GroupMemberFactory,
        {
          provide: PointGrantService,
          useValue: { grant: jest.fn() },
        },
        {
          provide: GroupRepository,
          useValue: { nextId: jest.fn(), save: jest.fn() },
        },
        {
          provide: GroupMemberRepository,
          useValue: { nextId: jest.fn(), save: jest.fn() },
        },
        {
          provide: InterestRepository,
          useValue: { findByIds: jest.fn() },
        },
        {
          provide: MessengerToken,
          useValue: { send: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(CreateGroupCommandHandler);
    groupFactory = testModule.get(GroupFactory);
    groupMemberFactory = testModule.get(GroupMemberFactory);
    pointGrantService = testModule.get(PointGrantService);
    groupRepository = testModule.get(GroupRepository);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    interestRepository = testModule.get(InterestRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    test('존재하지 않는 관심사일 때 예외가 발생해야 한다', async () => {
      interestRepository.findByIds.mockResolvedValue([]);

      const command = new CreateGroupCommand({
        requesterUserId: 100,
        title: 'title',
        category: GroupCategory.DOCUMENTATION,
        grade: GroupAccessGrade.MEMBER,
        interestIds: ['not-exist-interest-id'],
        purpose: 'purpose',
        technology: [],
        allowJoin: true,
        repository: 'https://repo.sitory',
      });
      await expect(handler.execute(command)).rejects.toThrowError(
        Message.SOME_INTERESTS_NOT_FOUND,
      );
    });

    test('새로운 그룹을 생성한 뒤 저장해야 한다', async () => {
      const newGroup = GroupFixture.inProgressJoinable();

      groupRepository.nextId.mockReturnValue('newGroupId');
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(groupFactory, 'create').mockReturnValue(newGroup);

      const command = new CreateGroupCommand({
        requesterUserId: 100,
        title: 'title',
        category: GroupCategory.DOCUMENTATION,
        grade: GroupAccessGrade.MEMBER,
        interestIds: [],
        purpose: 'purpose',
        technology: [],
        allowJoin: true,
        repository: 'https://repo.sitory',
      });
      await handler.execute(command);

      expect(groupRepository.save).toBeCalledWith(newGroup);
    });

    test('새로운 그룹 멤버 정보를 생성한 뒤 저장해야 한다', async () => {
      const newGroupMember = DomainFixture.generateGroupMember();

      groupRepository.nextId.mockReturnValue('newGroupId');
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(groupMemberFactory, 'create').mockReturnValue(newGroupMember);

      const command = new CreateGroupCommand({
        requesterUserId: 100,
        title: 'title',
        category: GroupCategory.DOCUMENTATION,
        grade: GroupAccessGrade.MEMBER,
        interestIds: [],
        purpose: 'purpose',
        technology: [],
        allowJoin: true,
        repository: 'https://repo.sitory',
      });
      await handler.execute(command);

      expect(groupMemberFactory.create).toBeCalled();

      expect(groupMemberRepository.save).toBeCalled();
      expect(groupMemberRepository.save).toBeCalledWith(newGroupMember);
    });

    test('그룹장에게 그룹 생성 포인트를 부여해야 한다', async () => {
      const newGroup = GroupFixture.inProgressJoinable();

      groupRepository.nextId.mockReturnValue('newGroupId');
      interestRepository.findByIds.mockResolvedValue([]);
      jest.spyOn(groupFactory, 'create').mockReturnValue(newGroup);

      const command = new CreateGroupCommand({
        requesterUserId: 100,
        title: 'title',
        category: GroupCategory.DOCUMENTATION,
        grade: GroupAccessGrade.MEMBER,
        interestIds: [],
        purpose: 'purpose',
        technology: [],
        allowJoin: true,
        repository: 'https://repo.sitory',
      });
      await handler.execute(command);

      expect(pointGrantService.grant).toBeCalledWith(
        expect.objectContaining({
          targetUserIds: [newGroup.adminUserId],
          amount: Point.GROUP_CREATED,
        }),
      );
    });
  });
});
