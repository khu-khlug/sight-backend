import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import {
  GroupQuery,
  IGroupQuery,
} from '@sight/app/application/group/query/IGroupQuery';
import { ListGroupMemberQuery } from '@sight/app/application/group/query/listGroupMember/ListGroupMemberQuery';
import { ListGroupMemberQueryHandler } from '@sight/app/application/group/query/listGroupMember/ListGroupMemberQueryHandler';
import { ListGroupMemberQueryResult } from '@sight/app/application/group/query/listGroupMember/ListGroupMemberQueryResult';
import { GroupMemberListView } from '@sight/app/application/group/query/view/GroupMemberListView';

import { ViewFixture } from '@sight/__test__/fixtures';

describe('ListGroupMemberQueryHandler', () => {
  let handler: ListGroupMemberQueryHandler;
  let groupQuery: jest.Mocked<IGroupQuery>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        ListGroupMemberQueryHandler,
        { provide: GroupQuery, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(ListGroupMemberQueryHandler);
    groupQuery = testModule.get(GroupQuery);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let query: ListGroupMemberQuery;
    let listView: GroupMemberListView;

    const groupId = 'groupId';
    const limit = 50;
    const offset = 0;

    beforeEach(() => {
      query = new ListGroupMemberQuery(groupId, limit, offset);
      listView = ViewFixture.generateGroupMemberListView();

      groupQuery.listGroupMember = jest.fn().mockResolvedValue(listView);
    });

    test('그룹 목록 쿼리를 실행해야 한다', async () => {
      await handler.execute(query);

      expect(groupQuery.listGroupMember).toBeCalledTimes(1);
    });

    test('그룹 목록 쿼리 결과를 반환해야 한다', async () => {
      const result = await handler.execute(query);

      const expected = new ListGroupMemberQueryResult(listView);
      expect(result).toEqual(expected);
    });
  });
});
