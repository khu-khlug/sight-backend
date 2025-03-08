import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { DiscordStateGenerator } from '@khlug/app/infra/discord/DiscordStateGenerator';

describe('DiscordStateGenerator', () => {
  let discordStateGenerator: DiscordStateGenerator;

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        DiscordStateGenerator,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue({ stateSecret: '' }),
          },
        },
      ],
    }).compile();

    discordStateGenerator = testModule.get(DiscordStateGenerator);
  });

  afterEach(() => clear());

  describe('generate', () => {
    test('해시를 생성해야 한다', () => {
      const userId = 1234;

      const result = discordStateGenerator.generate(userId);
      expect(result).toBeDefined();
    });
  });
});
