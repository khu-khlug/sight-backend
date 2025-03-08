import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { ApplyUserInfoToEnteredDiscordUserCommand } from '@khlug/app/application/user/command/applyUserInfoToEnteredDiscordUser/ApplyUserInfoToEnteredDiscordUserCommand';
import { ApplyUserInfoToEnteredDiscordUserCommandHandler } from '@khlug/app/application/user/command/applyUserInfoToEnteredDiscordUser/ApplyUserInfoToEnteredDiscordUserCommandHandler';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import {
  DiscordIntegrationRepositoryToken,
  IDiscordIntegrationRepository,
} from '@khlug/app/domain/discord/IDiscordIntegrationRepository';

import { DiscordIntegrationFixture } from '@khlug/__test__/fixtures/DiscordIntegrationFixture';

describe('ApplyUserInfoToEnteredDiscordUserCommandHandler', () => {
  let handler: ApplyUserInfoToEnteredDiscordUserCommandHandler;
  let discordMemberService: jest.Mocked<DiscordMemberService>;
  let discordIntegrationRepository: jest.Mocked<IDiscordIntegrationRepository>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        ApplyUserInfoToEnteredDiscordUserCommandHandler,
        {
          provide: DiscordMemberService,
          useValue: { reflectUserInfoToDiscordUser: jest.fn() },
        },
        {
          provide: DiscordIntegrationRepositoryToken,
          useValue: { findByDiscordUserId: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(ApplyUserInfoToEnteredDiscordUserCommandHandler);
    discordMemberService = testModule.get(DiscordMemberService);
    discordIntegrationRepository = testModule.get(
      DiscordIntegrationRepositoryToken,
    );
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('입장한 유저의 디스코드 연동 정보가 존재하지 않으면 유저 정보를 반영하지 않아야 한다', async () => {
      const discordUserId = 'discordUserId';

      discordIntegrationRepository.findByDiscordUserId.mockResolvedValue(null);

      const command = new ApplyUserInfoToEnteredDiscordUserCommand(
        discordUserId,
      );
      await handler.execute(command);

      expect(
        discordMemberService.reflectUserInfoToDiscordUser,
      ).not.toHaveBeenCalled();
    });

    test('입장한 유저의 디스코드 유저에 유저 정보를 반영해야 한다', async () => {
      const discordUserId = 'discordUserId';
      const discordIntegration = DiscordIntegrationFixture.normal();

      discordIntegrationRepository.findByDiscordUserId.mockResolvedValue(
        discordIntegration,
      );

      const command = new ApplyUserInfoToEnteredDiscordUserCommand(
        discordUserId,
      );
      await handler.execute(command);

      expect(
        discordMemberService.reflectUserInfoToDiscordUser,
      ).toHaveBeenCalledWith(discordIntegration.userId);
    });
  });
});
