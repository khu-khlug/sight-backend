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
import { CreateDiscordOAuth2UrlCommand } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOAuth2UrlCommand';
import { CreateDiscordOAuth2UrlCommandHandler } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOAuth2UrlCommandHandler';
import { CreateDiscordOAuth2UrlCommandResult } from '@khlug/app/application/user/command/createDiscordOAuth2Url/CreateDiscordOauth2UrlCommandResult';

describe('CreateDiscordOAuth2UrlCommandHandler', () => {
  let handler: CreateDiscordOAuth2UrlCommandHandler;
  let discordAdapter: jest.Mocked<IDiscordOAuth2Adapter>;
  let discordStateGenerator: jest.Mocked<IDiscordStateGenerator>;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        CreateDiscordOAuth2UrlCommandHandler,
        {
          provide: DiscordOAuth2AdapterToken,
          useValue: { createOAuth2Url: jest.fn() },
        },
        {
          provide: DiscordStateGeneratorToken,
          useValue: { generate: jest.fn() },
        },
      ],
    }).compile();

    handler = testModule.get(CreateDiscordOAuth2UrlCommandHandler);
    discordAdapter = testModule.get(DiscordOAuth2AdapterToken);
    discordStateGenerator = testModule.get(DiscordStateGeneratorToken);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('OAuth2 인증 URL을 생성해야 한다', async () => {
      const userId = 1234;
      const url = 'http://some.url-for.test/';

      discordStateGenerator.generate.mockReturnValue('state');
      discordAdapter.createOAuth2Url.mockReturnValue(url);

      const command = new CreateDiscordOAuth2UrlCommand(userId);
      const result = await handler.execute(command);
      const expected: CreateDiscordOAuth2UrlCommandResult = { url };

      expect(result).toEqual(expected);
    });
  });
});
