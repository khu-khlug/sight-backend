import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { CachedDiscordUserIdMapper } from '@khlug/app/infra/messenger/CachedDiscordUserIdMapper';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';

describe('CachedDiscordUserIdMapper', () => {
  let mapper: CachedDiscordUserIdMapper;
  let discordIntegrationRepository: jest.Mocked<IDiscordIntegrationRepository>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        CachedDiscordUserIdMapper,
        {
          provide: DiscordIntegrationRepositoryToken,
          useValue: { findByUserId: jest.fn() },
        },
      ],
    }).compile();

    mapper = testModule.get(CachedDiscordUserIdMapper);
    discordIntegrationRepository = testModule.get(
      DiscordIntegrationRepositoryToken,
    );
  });

  afterEach(() => clear());

  describe('toDiscordUserId', () => {
    test('처음 호출했다면 레포지토리에서 조회해야 한다', async () => {
      const discordIntegration = DiscordIntegrationFixture.normal();
      const dbFindFn = discordIntegrationRepository.findByUserId;

      dbFindFn.mockResolvedValue(discordIntegration);

      await mapper.toDiscordUserId(discordIntegration.userId);

      expect(dbFindFn).toHaveBeenCalledTimes(1);
    });

    test('1시간 이내에 다시 호출했다면 레포지토리를 거치지 않아야 한다', async () => {
      const discordIntegration = DiscordIntegrationFixture.normal();
      const dbFindFn = discordIntegrationRepository.findByUserId;

      dbFindFn.mockResolvedValue(discordIntegration);

      await mapper.toDiscordUserId(discordIntegration.userId);
      await mapper.toDiscordUserId(discordIntegration.userId);

      expect(dbFindFn).toHaveBeenCalledTimes(1);
    });

    test('1시간이 지난 시점에 다시 호출했다면 레포지토리에서 가져와야 한다', async () => {
      const discordIntegration = DiscordIntegrationFixture.normal();
      const dbFindFn = discordIntegrationRepository.findByUserId;

      dbFindFn.mockResolvedValue(discordIntegration);

      await mapper.toDiscordUserId(discordIntegration.userId);

      advanceTo(Date.now() + 1000 * 60 * 60 + 1);
      await mapper.toDiscordUserId(discordIntegration.userId);

      expect(dbFindFn).toHaveBeenCalledTimes(2);
    });

    test('디스코드 연동이 되어 있지 않다면 캐싱하지 않아야 한다', async () => {
      const dbFindFn = discordIntegrationRepository.findByUserId;

      dbFindFn.mockResolvedValue(null);

      await mapper.toDiscordUserId(123);
      await mapper.toDiscordUserId(123);

      expect(dbFindFn).toHaveBeenCalledTimes(2);
    });
  });
});
