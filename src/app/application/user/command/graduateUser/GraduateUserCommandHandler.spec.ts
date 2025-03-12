import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GraduateUserCommand } from '@khlug/app/application/user/command/graduateUser/GraduateUserCommand';
import { GraduateUserCommandHandler } from '@khlug/app/application/user/command/graduateUser/GraduateUserCommandHandler';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import { User } from '@khlug/app/domain/user/model/User';

import { UserFixture } from '@khlug/__test__/fixtures/domain';
import { Message } from '@khlug/constant/message';

describe('GraduateUserCommandHandler', () => {
  let handler: GraduateUserCommandHandler;
  let userRepository: jest.Mocked<EntityRepository<User>>;
  let discordMemberService: jest.Mocked<DiscordMemberService>;

  beforeEach(async () => {
    advanceTo(new Date());

    const em = { persistAndFlush: jest.fn() };

    const testModule = await Test.createTestingModule({
      providers: [
        GraduateUserCommandHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            getEntityManager: jest.fn().mockReturnValue(em),
          },
        },
        {
          provide: DiscordMemberService,
          useValue: {
            reflectUserInfoToDiscordUser: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = testModule.get(GraduateUserCommandHandler);
    userRepository = testModule.get(getRepositoryToken(User));
    discordMemberService = testModule.get(DiscordMemberService);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('유저가 존재하지 않으면 예외가 발생해야 한다', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const command = new GraduateUserCommand(1234);
      await expect(handler.execute(command)).rejects.toThrow(
        Message.USER_NOT_FOUND,
      );
    });

    test('졸업 처리를 진행해야 한다', async () => {
      const user = UserFixture.undergraduated();

      userRepository.findOne.mockResolvedValue(user);

      const command = new GraduateUserCommand(user.id);
      await handler.execute(command);

      expect(user.graduate()).toBeUndefined();
    });

    test('변경된 유저 정보를 디스코드에 반영해야 한다', async () => {
      const user = UserFixture.undergraduated();

      userRepository.findOne.mockResolvedValue(user);

      const command = new GraduateUserCommand(user.id);
      await handler.execute(command);

      expect(
        discordMemberService.reflectUserInfoToDiscordUser,
      ).toHaveBeenCalled();
    });
  });
});
