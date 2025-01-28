import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupMemberFactory } from '@khlug/app/domain/group/GroupMemberFactory';
import { GroupMember } from '@khlug/app/domain/group/model/GroupMember';

describe('GroupMemberFactory', () => {
  let groupMemberFactory: GroupMemberFactory;

  const groupMemberId = 'group-member-id';
  const userId = 123;
  const groupId = 'group-id';

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [GroupMemberFactory],
    }).compile();

    groupMemberFactory = testModule.get(GroupMemberFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 그룹 멤버를 생성해야 한다', () => {
      const expected = new GroupMember({
        id: groupMemberId,
        userId,
        groupId,
        createdAt: new Date(),
      });

      const group = groupMemberFactory.create({
        id: groupMemberId,
        userId,
        groupId,
      });

      expect(group).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    const createdAt = new Date();

    test('의도대로 그룹 멤버를 재구성해야 한다', () => {
      const expected = new GroupMember({
        id: groupMemberId,
        userId,
        groupId,
        createdAt,
      });

      const group = groupMemberFactory.reconstitute({
        id: groupMemberId,
        userId,
        groupId,
        createdAt,
      });

      expect(group).toEqual(expected);
    });
  });
});
