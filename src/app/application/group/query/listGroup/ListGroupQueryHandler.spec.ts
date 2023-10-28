import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import {
  GroupQuery,
  IGroupQuery,
} from '@sight/app/application/group/query/IGroupQuery';
import {
  GroupListQueryType,
  ListGroupQuery,
} from '@sight/app/application/group/query/listGroup/ListGroupQuery';
import { ListGroupQueryHandler } from '@sight/app/application/group/query/listGroup/ListGroupQueryHandler';
import { ListGroupQueryResult } from '@sight/app/application/group/query/listGroup/ListGroupQueryResult';
import { GroupListView } from '@sight/app/application/group/query/view/GroupListView';

import { ViewFixture } from '@sight/__test__/fixtures';

describe('ListGroupQueryHandler', () => {
  let handler: ListGroupQueryHandler;
  let groupQuery: jest.Mocked<IGroupQuery>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [ListGroupQueryHandler, { provide: GroupQuery, useValue: {} }],
    }).compile();

    handler = testModule.get(ListGroupQueryHandler);
    groupQuery = testModule.get(GroupQuery);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let query: ListGroupQuery;
    let listView: GroupListView;

    const queryType = GroupListQueryType.MY;
    const keyword = 'keyword';
    const interestId = 'interestId';
    const limit = 50;
    const offset = 0;

    beforeEach(() => {
      query = new ListGroupQuery(queryType, keyword, interestId, limit, offset);
      listView = ViewFixture.generateGroupListView();

      groupQuery.listGroup = jest.fn().mockResolvedValue(listView);
    });

    test('그룹 목록 쿼리를 실행해야 한다', async () => {
      await handler.execute(query);

      expect(groupQuery.listGroup).toBeCalledTimes(1);
    });

    test('그룹 목록 쿼리 결과를 반환해야 한다', async () => {
      const result = await handler.execute(query);

      const expected = new ListGroupQueryResult(listView);
      expect(result).toEqual(expected);
    });
  });
});
