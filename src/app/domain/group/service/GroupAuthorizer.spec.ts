import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import {
  CUSTOMER_SERVICE_GROUP_ID,
  GroupAccessGrade,
} from '@sight/app/domain/group/model/constant';
import { GroupAuthorizer } from '@sight/app/domain/group/service/GroupAuthorizer';
import { UserState } from '@sight/app/domain/user/model/constant';
import {
  GroupMemberRepository,
  IGroupMemberRepository,
} from '@sight/app/domain/group/IGroupMemberRepository';

import { DomainFixture } from '@sight/__test__/fixtures';

describe('GroupAuthorizer', () => {
  let groupAuthorizer: GroupAuthorizer;
  let groupMemberRepository: jest.Mocked<IGroupMemberRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GroupAuthorizer,
        { provide: GroupMemberRepository, useValue: {} },
      ],
    }).compile();

    groupAuthorizer = testModule.get(GroupAuthorizer);
    groupMemberRepository = testModule.get(GroupMemberRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('canRead', () => {
    test('그룹에 속해있다면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      const user = DomainFixture.generateUser();

      groupMemberRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValueOnce(DomainFixture.generateGroupMember());

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(true);
    });

    test('그룹이 비공개 그룹이고 유저가 그룹장이라면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.PRIVATE,
        adminUserId: 'group-admin-user-id',
      });
      const user = DomainFixture.generateUser({ id: 'group-admin-user-id' });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(true);
    });

    test('그룹이 비공개 그룹이고 유저가 그룹장이 아니라면 false를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.PRIVATE,
        adminUserId: 'group-admin-user-id',
      });
      const user = DomainFixture.generateUser({ id: 'other-user-id' });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(false);
    });

    test('그룹이 운영진 공개 그룹이고 유저가 운영진이라면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MANAGER,
      });
      const user = DomainFixture.generateUser({ manager: true });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(true);
    });

    test('그룹이 운영진 공개 그룹이고 유저가 운영진이 아니라면 false를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MANAGER,
      });
      const user = DomainFixture.generateUser({ manager: false });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(false);
    });

    test('그룹이 쿠러그 멤버 공개 그룹이고 유저의 상태가 휴학 중이라면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MEMBER,
      });
      const user = DomainFixture.generateUser({ state: UserState.ABSENCE });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(true);
    });

    test('그룹이 쿠러그 멤버 공개 그룹이고 유저의 상태가 재학 중이라면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MEMBER,
      });
      const user = DomainFixture.generateUser({
        state: UserState.UNDERGRADUATE,
      });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(true);
    });

    test('그룹이 쿠러그 멤버 공개 그룹이고 유저의 상태가 졸업이라면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MEMBER,
      });
      const user = DomainFixture.generateUser({ state: UserState.GRADUATE });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(true);
    });

    test('그룹이 쿠러그 멤버 공개 그룹이고 유저의 상태가 교류 회원이라면 false를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.MEMBER,
      });
      const user = DomainFixture.generateUser({ state: UserState.UNITED });

      const result = await groupAuthorizer.canRead(group, user);

      expect(result).toBe(false);
    });

    test('그룹이 전체 공개 그룹이라면 유저의 상태와 무관하게 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        grade: GroupAccessGrade.ALL,
      });

      Object.values(UserState).forEach(async (state) => {
        const user = DomainFixture.generateUser({ state });

        const result = await groupAuthorizer.canRead(group, user);

        expect(result).toBe(true);
      });
    });
  });

  describe('isMember', () => {
    const userId = 'userId';

    beforeEach(() => {
      groupMemberRepository.findByGroupIdAndUserId = jest.fn();
    });

    test('고객 센터 그룹이라면 항상 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup({
        id: CUSTOMER_SERVICE_GROUP_ID,
      });

      const result = await groupAuthorizer.isMember(group, userId);

      expect(result).toBe(true);
    });

    test('그룹에 속해있다면 true를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      groupMemberRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValueOnce(DomainFixture.generateGroupMember());

      const result = await groupAuthorizer.isMember(group, userId);

      expect(result).toBe(true);
    });

    test('그룹에 속해있지 않다면 false를 반환해야 한다', async () => {
      const group = DomainFixture.generateGroup();
      groupMemberRepository.findByGroupIdAndUserId = jest
        .fn()
        .mockResolvedValueOnce(null);

      const result = await groupAuthorizer.isMember(group, userId);

      expect(result).toBe(false);
    });
  });
});
