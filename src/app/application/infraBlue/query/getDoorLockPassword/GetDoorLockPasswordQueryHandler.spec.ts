import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GetDoorLockPasswordQueryHandler } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryHandler';
import { GetDoorLockPasswordQueryResult } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryResult';
import {
  CacheQueryToken,
  ICacheQuery,
} from '@khlug/app/application/infraBlue/query/ICacheQuery';
import { DoorLockPasswordView } from '@khlug/app/application/infraBlue/query/view/DoorLockPasswordView';

describe('GetDoorLockPasswordQueryHandler', () => {
  let handler: GetDoorLockPasswordQueryHandler;
  let cacheQuery: jest.Mocked<ICacheQuery>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GetDoorLockPasswordQueryHandler,
        {
          provide: CacheQueryToken,
          useValue: { getDoorLockPassword: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(GetDoorLockPasswordQueryHandler);
    cacheQuery = testModule.get(CacheQueryToken);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('도어락 비밀번호 뷰를 반환해야 한다', async () => {
      const view: DoorLockPasswordView = {
        master: '1234',
        forJajudy: '2345',
        forFacilityTeam: '3456',
      };

      cacheQuery.getDoorLockPassword.mockResolvedValue(view);

      const result = await handler.execute();
      const expected = new GetDoorLockPasswordQueryResult(view);

      expect(result).toEqual(expected);
    });
  });
});
