import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { UpdateDoorLockPasswordCommand } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommand';
import { UpdateDoorLockPasswordCommandHandler } from '@khlug/app/application/infraBlue/command/updateDoorLockPassword/UpdateDoorLockPasswordCommandHandler';

import { Cache, CacheId } from '@khlug/app/domain/cache/model/Cache';

import { CacheFixture } from '@khlug/__test__/fixtures/CacheFixture';
import { Message } from '@khlug/constant/error';

describe('UpdateDoorLockPasswordCommandHandler', () => {
  let handler: UpdateDoorLockPasswordCommandHandler;
  let cacheRepository: jest.Mocked<EntityRepository<Cache>>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        UpdateDoorLockPasswordCommandHandler,
        {
          provide: getRepositoryToken(Cache),
          useValue: {
            find: jest.fn(),
            getEntityManager: () => ({ persistAndFlush: jest.fn() }),
          },
        },
      ],
    }).compile();

    handler = testModule.get(UpdateDoorLockPasswordCommandHandler);
    cacheRepository = testModule.get(getRepositoryToken(Cache));
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('비밀번호 정보가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      cacheRepository.find.mockResolvedValue([]);

      const command = new UpdateDoorLockPasswordCommand({
        master: 'master',
        forJajudy: 'jajudy',
        forFacilityTeam: 'facilityTeam',
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.SOME_DOOR_LOCK_PASSWORD_NOT_FOUND,
      );
    });

    test('비밀번호를 변경해야 한다', async () => {
      const masterPassword = CacheFixture.raw({
        id: CacheId.masterPassword,
        content: 'oldMaster',
      });
      const jajudyPassword = CacheFixture.raw({
        id: CacheId.jajudyPassword,
        content: 'oldJajudy',
      });
      const facilityTeamPassword = CacheFixture.raw({
        id: CacheId.facilityTeamPassword,
        content: 'oldFacilityTeam',
      });

      cacheRepository.find.mockResolvedValue([
        masterPassword,
        jajudyPassword,
        facilityTeamPassword,
      ]);

      const command = new UpdateDoorLockPasswordCommand({
        master: 'newMaster',
        forJajudy: 'newJajudy',
        forFacilityTeam: 'newFacilityTeam',
      });
      await handler.execute(command);

      expect(masterPassword.content).toBe('newMaster');
      expect(jajudyPassword.content).toBe('newJajudy');
      expect(facilityTeamPassword.content).toBe('newFacilityTeam');
    });
  });
});
