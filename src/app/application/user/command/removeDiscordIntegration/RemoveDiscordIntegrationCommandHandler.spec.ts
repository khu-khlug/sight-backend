import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { RemoveDiscordIntegrationCommand } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommand';
import { RemoveDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/removeDiscordIntegration/RemoveDiscordIntegrationCommandHandler';

import { DiscordIntegration } from '@khlug/app/domain/discord/model/DiscordIntegration';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';
import { Message } from '@khlug/constant/message';

describe('RemoveDiscordIntegrationCommandHandler', () => {
  let handler: RemoveDiscordIntegrationCommandHandler;
  let discordIntegrationRepository: jest.Mocked<
    EntityRepository<DiscordIntegration>
  >;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        RemoveDiscordIntegrationCommandHandler,
        {
          provide: getRepositoryToken(DiscordIntegration),
          useValue: {
            findOne: jest.fn(),
            getEntityManager: jest.fn().mockReturnValue({
              removeAndFlush: jest.fn(),
            }),
          },
        },
      ],
    }).compile();

    handler = testModule.get(RemoveDiscordIntegrationCommandHandler);
    discordIntegrationRepository = testModule.get(
      getRepositoryToken(DiscordIntegration),
    );
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('디스코드 연동 정보가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const userId = 1234;

      discordIntegrationRepository.findOne.mockResolvedValue(null);

      const command = new RemoveDiscordIntegrationCommand(userId);
      await expect(handler.execute(command)).rejects.toThrow(
        Message.DISCORD_INTEGRATION_NOT_FOUND,
      );
    });

    test('디스코드 연동 정보를 제거해야 한다', async () => {
      const userId = 1234;
      const prev = DiscordIntegrationFixture.normal();

      discordIntegrationRepository.findOne.mockResolvedValue(prev);

      const command = new RemoveDiscordIntegrationCommand(userId);
      await handler.execute(command);

      expect(
        discordIntegrationRepository.getEntityManager().removeAndFlush,
      ).toHaveBeenCalled();
    });
  });
});
