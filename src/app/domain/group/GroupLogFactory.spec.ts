import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupLogFactory } from '@khlug/app/domain/group/GroupLogFactory';
import { GroupLog } from '@khlug/app/domain/group/model/GroupLog';

describe('GroupLogFactory', () => {
  let groupLogFactory: GroupLogFactory;

  const logId = 'group-log-id';
  const userId = 'user-id';
  const groupId = 'group-id';
  const message = 'some-message-for-group-activity';

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [GroupLogFactory],
    }).compile();

    groupLogFactory = testModule.get(GroupLogFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 그룹을 생성해야 한다', () => {
      const expected = new GroupLog({
        id: logId,
        groupId,
        userId,
        message,
        createdAt: new Date(),
      });

      const groupLog = groupLogFactory.create({
        id: logId,
        groupId,
        userId,
        message,
      });

      expect(groupLog).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    const createdAt = new Date();

    test('의도대로 그룹을 재구성해야 한다', () => {
      const expected = new GroupLog({
        id: logId,
        groupId,
        userId,
        message,
        createdAt,
      });

      const groupLog = groupLogFactory.reconstitute({
        id: logId,
        groupId,
        userId,
        message,
        createdAt,
      });

      expect(groupLog).toEqual(expected);
    });
  });
});
