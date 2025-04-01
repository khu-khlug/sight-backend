import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GetDiscordIntegrationQuery } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQuery';
import { GetDiscordIntegrationQueryHandler } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryHandler';
import { GetDiscordIntegrationQueryResult } from '@khlug/app/application/user/query/getDiscordIntegration/GetDiscordIntegrationQueryResult';
import {
  DiscordIntegrationQueryToken,
  IDiscordIntegrationQuery,
} from '@khlug/app/application/user/query/IDiscordIntegrationQuery';
import { DiscordIntegrationView } from '@khlug/app/application/user/query/view/DiscordIntegrationView';

import { Message } from '@khlug/constant/error';

describe('GetDiscordIntegrationQueryHandler', () => {
  let handler: GetDiscordIntegrationQueryHandler;
  let discordIntegrationRepository: jest.Mocked<IDiscordIntegrationQuery>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        GetDiscordIntegrationQueryHandler,
        {
          provide: DiscordIntegrationQueryToken,
          useValue: { findByUserId: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(GetDiscordIntegrationQueryHandler);
    discordIntegrationRepository = testModule.get(DiscordIntegrationQueryToken);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('디스코드 연동 정보가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      discordIntegrationRepository.findByUserId.mockResolvedValue(null);

      const query = new GetDiscordIntegrationQuery(1234);
      await expect(handler.execute(query)).rejects.toThrow(
        Message.DISCORD_INTEGRATION_NOT_FOUND,
      );
    });

    test('디스코드 연동 정보를 반환해야 한다', async () => {
      const view: DiscordIntegrationView = {
        id: 'discord-integration-id',
        userId: 1234,
        discordUserId: 'discord-user-id',
        createdAt: new Date(),
      };
      discordIntegrationRepository.findByUserId.mockResolvedValue(view);

      const query = new GetDiscordIntegrationQuery(1234);
      const result = await handler.execute(query);
      const expected = new GetDiscordIntegrationQueryResult(view);

      expect(result).toEqual(expected);
    });
  });
});
