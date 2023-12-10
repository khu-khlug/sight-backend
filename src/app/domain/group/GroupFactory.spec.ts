import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupCreated } from '@sight/app/domain/group/event/GroupCreated';
import { GroupFactory } from '@sight/app/domain/group/GroupFactory';
import { Group } from '@sight/app/domain/group/model/Group';
import {
  GroupAccessGrade,
  GroupCategory,
  GroupState,
} from '@sight/app/domain/group/model/constant';

describe('GroupFactory', () => {
  let groupFactory: GroupFactory;

  const groupId = 'group-id';
  const category = GroupCategory.STUDY;
  const state = GroupState.PROGRESS;
  const title = 'title';
  const authorUserId = 'author-user-id';
  const adminUserId = 'admin-user-id';
  const purpose = null;
  const interestIds = [];
  const technology = [];
  const grade = GroupAccessGrade.MEMBER;
  const lastUpdaterUserId = 'last-updater-user-id';
  const repository = null;
  const allowJoin = true;
  const hasPortfolio = false;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [GroupFactory],
    }).compile();

    groupFactory = testModule.get(GroupFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 그룹을 생성해야 한다', () => {
      const expected = new Group({
        id: groupId,
        category,
        state,
        title,
        authorUserId,
        adminUserId,
        purpose,
        interestIds,
        technology,
        grade,
        lastUpdaterUserId,
        repository,
        allowJoin,
        hasPortfolio: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      expected.apply(new GroupCreated(expected));

      const group = groupFactory.create({
        id: groupId,
        category,
        state,
        title,
        authorUserId,
        adminUserId,
        purpose,
        interestIds,
        technology,
        grade,
        lastUpdaterUserId,
        repository,
        allowJoin,
      });

      expect(group).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    const createdAt = new Date();
    const updatedAt = new Date();

    test('의도대로 그룹을 재구성해야 한다', () => {
      const expected = new Group({
        id: groupId,
        category,
        state,
        title,
        authorUserId,
        adminUserId,
        purpose,
        interestIds,
        technology,
        grade,
        lastUpdaterUserId,
        repository,
        allowJoin,
        hasPortfolio,
        createdAt,
        updatedAt,
      });

      const group = groupFactory.reconstitute({
        id: groupId,
        category,
        state,
        title,
        authorUserId,
        adminUserId,
        purpose,
        interestIds,
        technology,
        grade,
        lastUpdaterUserId,
        repository,
        allowJoin,
        hasPortfolio,
        createdAt,
        updatedAt,
      });

      expect(group).toEqual(expected);
    });
  });
});
