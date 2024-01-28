import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupBookmarkCreated } from '@sight/app/domain/group/event/GroupBookmarkCreated';
import { GroupBookmarkFactory } from '@sight/app/domain/group/GroupBookmarkFactory';
import { GroupBookmark } from '@sight/app/domain/group/model/GroupBookmark';

describe('GroupBookmarkFactory', () => {
  let groupBookmarkFactory: GroupBookmarkFactory;

  const bookmarkId = 'group-bookmark-id';
  const userId = 'user-id';
  const groupId = 'group-id';

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [GroupBookmarkFactory],
    }).compile();

    groupBookmarkFactory = testModule.get(GroupBookmarkFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 그룹 즐겨찾기를 생성해야 한다', () => {
      const expected = new GroupBookmark({
        id: bookmarkId,
        groupId,
        userId,
        createdAt: new Date(),
      });
      expected.apply(new GroupBookmarkCreated(groupId, userId));

      const bookmark = groupBookmarkFactory.create({
        id: bookmarkId,
        groupId,
        userId,
      });

      expect(bookmark).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    const createdAt = new Date();

    test('의도대로 그룹 즐겨찾기를 재구성해야 한다', () => {
      const expected = new GroupBookmark({
        id: bookmarkId,
        groupId,
        userId,
        createdAt,
      });

      const bookmark = groupBookmarkFactory.reconstitute({
        id: bookmarkId,
        groupId,
        userId,
        createdAt,
      });

      expect(bookmark).toEqual(expected);
    });
  });
});
