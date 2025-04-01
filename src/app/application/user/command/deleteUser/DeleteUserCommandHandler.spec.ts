import { EntityRepository } from '@mikro-orm/mysql';
import { getRepositoryToken } from '@mikro-orm/nestjs';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { DeleteUserCommand } from '@khlug/app/application/user/command/deleteUser/DeleteUserCommand';
import { DeleteUserCommandHandler } from '@khlug/app/application/user/command/deleteUser/DeleteUserCommandHandler';
import { DiscordMemberService } from '@khlug/app/application/user/service/DiscordMemberService';

import { User } from '@khlug/app/domain/user/model/User';

import { UserFixture } from '@khlug/__test__/fixtures/domain';
import { Message } from '@khlug/constant/error';

describe('DeleteUserCommandHandler', () => {
  let handler: DeleteUserCommandHandler;
  let userRepository: jest.Mocked<EntityRepository<User>>;
  let discordMemberService: jest.Mocked<DiscordMemberService>;

  beforeEach(async () => {
    advanceTo(new Date());

    const em = {
      persistAndFlush: jest.fn(),
    };

    const testModule = await Test.createTestingModule({
      providers: [
        DeleteUserCommandHandler,
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
            clearDiscordIntegration: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = testModule.get(DeleteUserCommandHandler);
    userRepository = testModule.get(getRepositoryToken(User));
    discordMemberService = testModule.get(DiscordMemberService);
  });

  afterEach(() => clear());

  describe('execute', () => {
    test('유저가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      const userId = 123;

      userRepository.findOne.mockResolvedValue(null);

      const command = new DeleteUserCommand(userId);
      await expect(handler.execute(command)).rejects.toThrow(
        Message.USER_NOT_FOUND,
      );
    });

    test('유저를 제거해야 한다', async () => {
      const user = UserFixture.undergraduated();

      userRepository.findOne.mockResolvedValue(user);

      const command = new DeleteUserCommand(user.id);
      await handler.execute(command);

      expect(
        userRepository.getEntityManager().persistAndFlush,
      ).toHaveBeenCalled();
    });

    test('디스코드 연동 정보를 제거해야 한다', async () => {
      const user = UserFixture.undergraduated();

      userRepository.findOne.mockResolvedValue(user);

      const command = new DeleteUserCommand(user.id);
      await handler.execute(command);

      expect(discordMemberService.clearDiscordIntegration).toHaveBeenCalled();
    });
  });
});
