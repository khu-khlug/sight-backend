import { Test } from '@nestjs/testing';

import { ListUserQueryHandler } from '@sight/app/application/user/query/listUser/ListUserQueryHandler';
import { IUserQuery } from '@sight/app/application/user/query/IUserQuery';
import { ListUserQueryResult } from './ListUserQueryResult';
import { ViewFixture } from '@sight/__test__/fixtures';
import { UserListView } from '../view/UserListView';
import { ListUserQuery } from './ListUserQuery';
import { UserState } from '@sight/app/domain/user/model/constant';

describe('ListUserQueryHandler', () => {
  let listUserQueryHandler: ListUserQueryHandler;
  let userQuery: IUserQuery;

  beforeAll(async () => {
    const testModule = await Test.createTestingModule({
      providers: [ListUserQueryHandler, { provide: 'UserQuery', useValue: {} }],
    }).compile();

    listUserQueryHandler = testModule.get(ListUserQueryHandler);
    userQuery = testModule.get('UserQuery');
  });

  describe('execute', () => {
    let listView: UserListView;

    const state = UserState.UNDERGRADUATE;
    const limit = 5;
    const offset = 0;

    beforeEach(() => {
      listView = ViewFixture.generateUserListView();
      userQuery.listUser = jest.fn().mockResolvedValue(listView);
    });

    test('파라미터를 의도대로 쿼리에 넘겨주어야 한다', async () => {
      const query = new ListUserQuery(state, limit, offset);

      await listUserQueryHandler.execute(query);

      expect(userQuery.listUser).toBeCalledTimes(1);
      expect(userQuery.listUser).toBeCalledWith({
        state,
        limit,
        offset,
      });
    });

    test('유저 목록 뷰를 의도대로 반환해야 한다', async () => {
      const query = new ListUserQuery(state, limit, offset);

      const queryResult = await listUserQueryHandler.execute(query);

      const expected = new ListUserQueryResult(listView);
      expect(queryResult).toEqual(expected);
    });
  });
});
