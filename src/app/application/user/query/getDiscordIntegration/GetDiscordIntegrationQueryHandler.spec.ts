import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GetDiscordIntegrationQuery } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQuery';
import { GetDiscordIntegrationQueryHandler } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryHandler';
import { GetDiscordIntegrationQueryResult } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryResult';

import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';
import { Message } from '@khlug/constant/message';

describe('GetDiscordIntegrationQueryHandler', () => {
  let handler: GetDiscordIntegrationQueryHandler;
  let discordIntegrationRepository: jest.Mocked<
    EntityRepository<DiscordIntegration>
  >;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GetDiscordIntegrationQueryHandler,
        {
          provide: getRepositoryToken(DiscordIntegration),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(GetDiscordIntegrationQueryHandler);
    discordIntegrationRepository = testModule.get(
      getRepositoryToken(DiscordIntegration),
    );
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('디스코드 연동 정보가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      discordIntegrationRepository.findOne.mockResolvedValue(null);

      const query = new GetDiscordIntegrationQuery(1234);
      await expect(handler.execute(query)).rejects.toThrow(
        Message.DISCORD_INTEGRATION_NOT_FOUND,
      );
    });

    test('디스코드 연동 정보를 반환해야 한다', async () => {
      const fixture = DiscordIntegrationFixture.normal();
      discordIntegrationRepository.findOne.mockResolvedValue(fixture);

      const query = new GetDiscordIntegrationQuery(1234);
      const result = await handler.execute(query);
      const expected: GetDiscordIntegrationQueryResult = {
        discordIntegration: fixture,
      };

      expect(result).toEqual(expected);
    });
  });
});
