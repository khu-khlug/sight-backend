import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import {
  DiscordOAuth2AdapterToken,
  IDiscordOAuth2Adapter,
} from '@khlug/app/application/adapter/IDiscordOAuth2Adapter';
import {
  DiscordStateGeneratorToken,
  IDiscordStateGenerator,
} from '@khlug/app/application/adapter/IDiscordStateGenerator';
import { CreateDiscordIntegrationCommand } from '@khlug/app/application/user/command/createDiscordIntegration/CreateDiscordIntegrationCommand';
import { CreateDiscordIntegrationCommandHandler } from '@khlug/app/application/user/command/createDiscordIntegration/CreateDiscordIntegrationCommandHandler';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';
import { Message } from '@khlug/constant/message';

describe('CreateDiscordIntegrationCommandHandler', () => {
  let handler: CreateDiscordIntegrationCommandHandler;
  let discordMemberService: jest.Mocked<DiscordMemberService>;
  let discordStateGenerator: jest.Mocked<IDiscordStateGenerator>;
  let discordAdapter: jest.Mocked<IDiscordOAuth2Adapter>;
  let discordIntegrationRepository: jest.Mocked<IDiscordIntegrationRepository>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        CreateDiscordIntegrationCommandHandler,
        {
          provide: DiscordMemberService,
          useValue: { reflectUserInfoToDiscordUser: jest.fn() },
        },
        {
          provide: DiscordStateGeneratorToken,
          useValue: { generate: jest.fn() },
        },
        {
          provide: DiscordOAuth2AdapterToken,
          useValue: {
            getAccessToken: jest.fn(),
            getCurrentUserId: jest.fn(),
          },
        },
        {
          provide: DiscordIntegrationRepositoryToken,
          useValue: {
            findByUserId: jest.fn(),
            insert: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = testModule.get(CreateDiscordIntegrationCommandHandler);
    discordMemberService = testModule.get(DiscordMemberService);
    discordStateGenerator = testModule.get(DiscordStateGeneratorToken);
    discordAdapter = testModule.get(DiscordOAuth2AdapterToken);
    discordIntegrationRepository = testModule.get(
      DiscordIntegrationRepositoryToken,
    );
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('주어진 상태값이 생성한 상태값과 다르면 예외를 발생시켜야 한다', async () => {
      const userId = 1234;
      const code = 'code';
      const state = 'state';

      discordStateGenerator.generate.mockReturnValue('other-state');

      const command = new CreateDiscordIntegrationCommand({
        userId,
        code,
        state,
      });
      await expect(handler.execute(command)).rejects.toThrow(
        Message.INVALID_DISCORD_STATE,
      );
    });

    test('이미 디스코드 연동 정보가 존재하면 새로운 디스코드 연동 정보를 생성하지 않아야 한다', async () => {
      const userId = 1234;
      const code = 'code';
      const state = 'state';
      const prev = DiscordIntegrationFixture.normal();

      discordStateGenerator.generate.mockReturnValue(state);
      discordIntegrationRepository.findByUserId.mockResolvedValue(prev);

      const command = new CreateDiscordIntegrationCommand({
        userId,
        code,
        state,
      });
      await handler.execute(command);

      expect(discordIntegrationRepository.insert).not.toHaveBeenCalled();
    });

    test('새로운 디스코드 연동 정보를 생성해야 한다', async () => {
      const userId = 1234;
      const code = 'code';
      const state = 'state';

      discordStateGenerator.generate.mockReturnValue(state);
      discordIntegrationRepository.findByUserId.mockResolvedValue(null);
      discordAdapter.getAccessToken.mockResolvedValue('access-token');
      discordAdapter.getCurrentUserId.mockResolvedValue('discord-user-id');

      const command = new CreateDiscordIntegrationCommand({
        userId,
        code,
        state,
      });
      await handler.execute(command);

      expect(discordIntegrationRepository.insert).toHaveBeenCalled();
    });

    test('유저 정보를 디스코드 유저에 반영해야 한다', async () => {
      const userId = 1234;
      const code = 'code';
      const state = 'state';

      discordStateGenerator.generate.mockReturnValue(state);
      discordIntegrationRepository.findByUserId.mockResolvedValue(null);
      discordAdapter.getAccessToken.mockResolvedValue('access-token');
      discordAdapter.getCurrentUserId.mockResolvedValue('discord-user-id');

      const command = new CreateDiscordIntegrationCommand({
        userId,
        code,
        state,
      });
      await handler.execute(command);

      expect(
        discordMemberService.reflectUserInfoToDiscordUser,
      ).toHaveBeenCalled();
    });
  });
});
