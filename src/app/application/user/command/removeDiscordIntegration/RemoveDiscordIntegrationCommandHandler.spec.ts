import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { RemoveDiscordIntegrationCommand } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommand';
import { RemoveDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommandHandler';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';
import { Message } from '@khlug/constant/message';

describe('RemoveDiscordIntegrationCommandHandler', () => {
  let handler: RemoveDiscordIntegrationCommandHandler;
  let discordIntegrationRepository: jest.Mocked<IDiscordIntegrationRepository>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        RemoveDiscordIntegrationCommandHandler,
        {
          provide: DiscordIntegrationRepositoryToken,
          useValue: {
            findByUserId: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = testModule.get(RemoveDiscordIntegrationCommandHandler);
    discordIntegrationRepository = testModule.get(
      DiscordIntegrationRepositoryToken,
    );
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('디스코드 연동 정보가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const userId = 1234;

      discordIntegrationRepository.findByUserId.mockResolvedValue(null);

      const command = new RemoveDiscordIntegrationCommand(userId);
      await expect(handler.execute(command)).rejects.toThrow(
        Message.DISCORD_INTEGRATION_NOT_FOUND,
      );
    });

    test('디스코드 연동 정보를 제거해야 한다', async () => {
      const userId = 1234;
      const prev = DiscordIntegrationFixture.normal();

      discordIntegrationRepository.findByUserId.mockResolvedValue(prev);

      const command = new RemoveDiscordIntegrationCommand(userId);
      await handler.execute(command);

      expect(discordIntegrationRepository.remove).toHaveBeenCalled();
    });
  });
});
