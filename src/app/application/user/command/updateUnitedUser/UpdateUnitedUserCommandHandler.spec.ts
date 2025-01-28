import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { UpdateUnitedUserCommand } from '@khlug/app/application/user/command/updateUnitedUser/UpdateUnitedUserCommand';
import { UpdateUnitedUserCommandHandler } from '@khlug/app/application/user/command/updateUnitedUser/UpdateUnitedUserCommandHandler';

import {
  IUserRepository,
  UserRepository,
} from '@khlug/app/domain/user/IUserRepository';
import { UserState } from '@khlug/app/domain/user/model/constant';
import { User } from '@khlug/app/domain/user/model/User';

import { generateUser } from '@khlug/__test__/fixtures/domain';
import { Message } from '@khlug/constant/message';

jest.mock('@khlug/core/persistence/transaction/Transactional', () => ({
  Transactional: () => () => {},
}));

describe('UpdateUnitedUserCommandHandler', () => {
  let handler: UpdateUnitedUserCommandHandler;
  let userRepository: jest.Mocked<IUserRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        UpdateUnitedUserCommandHandler,
        { provide: UserRepository, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(UpdateUnitedUserCommandHandler);
    userRepository = testModule.get(UserRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let user: User;
    let command: UpdateUnitedUserCommand;

    const userId = 123;
    const newEmail = 'new-email@email.com';

    beforeEach(() => {
      user = generateUser({ id: userId, state: UserState.UNITED });
      command = new UpdateUnitedUserCommand(userId, newEmail);

      userRepository.findById = jest.fn().mockResolvedValue(user);

      userRepository.save = jest.fn();
    });

    test('교류 유저가 존재하지 않으면 예외를 발생시켜야 한다', async () => {
      userRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.USER_NOT_FOUND,
      );
    });

    test('교류 유저의 이메일을 수정해야 한다', async () => {
      await handler.execute(command);

      expect(user.profile.email).toEqual(newEmail);
    });

    test('변경된 유저의 정보를 저장해야 한다', async () => {
      await handler.execute(command);

      expect(userRepository.save).toBeCalledWith(user);
      expect(userRepository.save).toBeCalledTimes(1);
    });
  });
});
