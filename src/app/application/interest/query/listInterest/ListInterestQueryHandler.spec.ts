import { Test } from '@nestjs/testing';

import { IInterestQuery } from '@sight/app/application/interest/query/IInterestQuery';
import { ListInterestQueryHandler } from '@sight/app/application/interest/query/listInterest/ListInterestQueryHandler';
import { ListInterestQueryResult } from '@sight/app/application/interest/query/listInterest/ListInterestQueryResult';
import { InterestListView } from '@sight/app/application/interest/query/view/InterestListView';

import { ViewFixture } from '@sight/__test__/fixtures';

describe('ListInterestQueryHandler', () => {
  let listInterestQueryHandler: ListInterestQueryHandler;
  let interestQuery: IInterestQuery;

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [
        ListInterestQueryHandler,
        { provide: 'InterestQuery', useValue: {} },
      ],
    }).compile();

    listInterestQueryHandler = testModule.get(ListInterestQueryHandler);
    interestQuery = testModule.get('InterestQuery');
  });

  describe('execute', () => {
    let listView: InterestListView;

    beforeEach(() => {
      listView = ViewFixture.generateInterestListView();
      interestQuery.listInterest = jest.fn().mockResolvedValue(listView);
    });

    test('유저 목록 뷰를 의도대로 반환해야 한다', async () => {
      const queryResult = await listInterestQueryHandler.execute();
      const expected = new ListInterestQueryResult(listView);
      expect(queryResult).toEqual(expected);
    });
  });
});
