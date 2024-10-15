import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GetDoorLockPasswordQueryHandler } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryHandler';
import { GetDoorLockPasswordQueryResult } from '@khlug/app/application/infraBlue/query/getDoorLockPassword/GetDoorLockPasswordQueryResult';

import { Cache, CacheId } from '@khlug/app/domain/cache/model/Cache';

import { CacheFixture } from '@khlug/__test__/fixtures/CacheFixture';
import { Message } from '@khlug/constant/message';

describe('GetDoorLockPasswordQueryHandler', () => {
  let handler: GetDoorLockPasswordQueryHandler;
  let cacheRepository: jest.Mocked<EntityRepository<Cache>>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GetDoorLockPasswordQueryHandler,
        {
          provide: getRepositoryToken(Cache),
          useValue: { find: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(GetDoorLockPasswordQueryHandler);
    cacheRepository = testModule.get(getRepositoryToken(Cache));
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('도어락 비밀번호가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      cacheRepository.find.mockResolvedValue([]);

      await expect(handler.execute()).rejects.toThrow(
        Message.SOME_DOOR_LOCK_PASSWORD_NOT_FOUND,
      );
    });

    test('도어락 비밀번호를 반환해야 한다', async () => {
      const masterPassword = CacheFixture.raw({
        id: CacheId.masterPassword,
        content: 'master',
      });
      const jajudyPassword = CacheFixture.raw({
        id: CacheId.jajudyPassword,
        content: 'jajudy',
      });
      const facilityTeamPassword = CacheFixture.raw({
        id: CacheId.facilityTeamPassword,
        content: 'facilityTeam',
      });

      cacheRepository.find.mockResolvedValue([
        masterPassword,
        jajudyPassword,
        facilityTeamPassword,
      ]);

      const result = await handler.execute();
      const expected = new GetDoorLockPasswordQueryResult({
        master: 'master',
        forJajudy: 'jajudy',
        forFacilityTeam: 'facilityTeam',
      });

      expect(result).toEqual(expected);
    });
  });
});
