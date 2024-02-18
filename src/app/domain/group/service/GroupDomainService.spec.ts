import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupMemberFactory } from '@sight/app/domain/group/GroupMemberFactory';
import { CUSTOMER_SERVICE_GROUP_ID } from '@sight/app/domain/group/model/constant';
import { GroupAuthorizer } from '@sight/app/domain/group/service/GroupAuthorizer';
import { GroupDomainService } from '@sight/app/domain/group/service/GroupDomainService';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';

import { DomainFixture } from '@sight/__test__/fixtures';
import { generateEmptyProviders } from '@sight/__test__/util';
import { Message } from '@sight/constant/message';

describe('GroupDomainService', () => {
  let groupDomainService: GroupDomainService;
  let groupMemberFactory: GroupMemberFactory;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;
  let groupAuthorizer: jest.Mocked<GroupAuthorizer>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupDomainService,
        GroupMemberFactory,
        ...generateEmptyProviders(GroupMemberRepository, GroupAuthorizer),
      ],
    }).compile();

    groupDomainService = testModule.get(GroupDomainService);
    groupMemberFactory = testModule.get(GroupMemberFactory);
    groupMemberRepository = testModule.get(GroupMemberRepository);
    groupAuthorizer = testModule.get(GroupAuthorizer);
  });

  afterAll(() => {
    clear();
  });

  describe('joinGroup', () => {
    const newGroupMemberId = 'new-group-member-id';

    beforeEach(() => {
      groupAuthorizer.canRead = jest.fn().mockResolvedValue(true);
      groupAuthorizer.isMember = jest.fn().mockResolvedValue(false);
      groupMemberRepository.nextId = jest
        .fn()
        .mockReturnValue(newGroupMemberId);

      groupMemberRepository.save = jest.fn();
    });

    test('그룹의 참여가 제한되어 있다면 예외를 발생시켜야 한다', async () => {
      const group = DomainFixture.generateGroup({ allowJoin: false });
      const user = DomainFixture.generateUser();

      await expect(
        groupDomainService.joinGroup(group, user),
      ).rejects.toThrowError(Message.GROUP_JOIN_NOT_ALLOWED);
    });

    test('유저가 그룹에 접근할 권한이 없다면 예외를 발생시켜야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser();

      groupAuthorizer.canRead = jest.fn().mockResolvedValueOnce(false);

      await expect(
        groupDomainService.joinGroup(group, user),
      ).rejects.toThrowError(Message.CANNOT_READ_GROUP);
    });

    test('참여할 그룹이 고객센터 그룹이라면 예외를 발생시켜야 한다', async () => {
      const group = DomainFixture.generateGroup({
        id: CUSTOMER_SERVICE_GROUP_ID,
      });
      const user = DomainFixture.generateUser();

      await expect(
        groupDomainService.joinGroup(group, user),
      ).rejects.toThrowError(Message.ALREADY_JOINED_GROUP);
    });

    test('이미 그룹의 멤버라면 예외를 발생시켜야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser();

      groupAuthorizer.isMember = jest.fn().mockResolvedValueOnce(true);

      await expect(
        groupDomainService.joinGroup(group, user),
      ).rejects.toThrowError(Message.ALREADY_JOINED_GROUP);
    });

    test('그룹 멤버를 생성해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser();

      jest.spyOn(groupMemberFactory, 'create');

      await groupDomainService.joinGroup(group, user);

      expect(groupMemberFactory.create).toBeCalled();
      expect(groupMemberRepository.save).toBeCalled();
    });
  });
});
