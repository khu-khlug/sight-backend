import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { UpdateUserCommand } from '@sight/app/application/user/command/updateUser/UpdateUserCommand';
import { UpdateUserCommandHandler } from '@sight/app/application/user/command/updateUser/UpdateUserCommandHandler';
import { UpdateUserCommandResult } from '@sight/app/application/user/command/updateUser/UpdateUserCommandResult';

import { Interest } from '@sight/app/domain/interest/model/Interest';
import { UserInterestFactory } from '@sight/app/domain/interest/UserInterestFactory';
import { UserState } from '@sight/app/domain/user/model/constant';
import { User } from '@sight/app/domain/user/model/User';
import {
  ISlackSender,
  SlackSender,
} from '@sight/app/domain/adapter/ISlackSender';
import {
  IInterestRepository,
  InterestRepository,
} from '@sight/app/domain/interest/IInterestRepository';
import {
  IUserInterestRepository,
  UserInterestRepository,
} from '@sight/app/domain/interest/IUserInterestRepository';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';

import { Message } from '@sight/constant/message';
import {
  generateInterest,
  generateUser,
} from '@sight/__test__/fixtures/domain';

jest.mock('@sight/core/persistence/transaction/Transactional', () => ({
  Transactional: () => () => {},
}));

describe('UpdateUserCommandHandler', () => {
  let handler: UpdateUserCommandHandler;
  let userInterestFactory: UserInterestFactory;
  let userRepository: jest.Mocked<IUserRepository>;
  let interestRepository: jest.Mocked<IInterestRepository>;
  let userInterestRepository: jest.Mocked<IUserInterestRepository>;
  let slackSender: jest.Mocked<ISlackSender>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        UpdateUserCommandHandler,
        UserInterestFactory,
        { provide: UserRepository, useValue: {} },
        { provide: InterestRepository, useValue: {} },
        { provide: UserInterestRepository, useValue: {} },
        { provide: SlackSender, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(UpdateUserCommandHandler);
    userInterestFactory = testModule.get(UserInterestFactory);
    userRepository = testModule.get(UserRepository);
    interestRepository = testModule.get(InterestRepository);
    userInterestRepository = testModule.get(UserInterestRepository);
    slackSender = testModule.get(SlackSender);
  });

  afterAll(() => {
    clear();
  });

  describe('execute', () => {
    let user: User;
    let interests: Interest[];
    let command: UpdateUserCommand;

    const newUserInterestIds = ['new-user-interest-1', 'new-user-interest-2'];

    const userId = 'userId';
    const email = 'email@email.com';
    const phone = null;
    const homepage = 'https://some.home.page/';
    const languages = ['some', 'languages'];
    const interestIds = ['interest1', 'interest2'];
    const prefer = 'some-prefers';

    beforeEach(() => {
      user = generateUser({ state: UserState.UNDERGRADUATE });
      interests = interestIds.map((interestId) =>
        generateInterest({ id: interestId }),
      );
      command = new UpdateUserCommand(
        userId,
        email,
        phone,
        homepage,
        languages,
        interestIds,
        prefer,
      );

      userRepository.findById = jest.fn().mockResolvedValue(user);
      interestRepository.findByIds = jest.fn().mockResolvedValue(interests);
      userInterestRepository.nextId = jest
        .fn()
        .mockReturnValueOnce(newUserInterestIds[0])
        .mockReturnValueOnce(newUserInterestIds[1]);

      jest.spyOn(user, 'setProfile');
      userRepository.save = jest.fn();
      userInterestRepository.removeByUserId = jest.fn();
      userInterestRepository.save = jest.fn();
      slackSender.send = jest.fn();
    });

    test('주어진 유저 ID에 해당하는 유저가 존재하지 않을 때, 예외를 발생시켜야 한다', async () => {
      userRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.USER_NOT_FOUND,
      );
    });

    test('주어진 관심 분야가 존재하지 않을 때, 예외를 발생시켜야 한다', async () => {
      interestRepository.findByIds = jest
        .fn()
        .mockResolvedValue([interests[0]]);

      await expect(handler.execute(command)).rejects.toThrowError(
        Message.SOME_INTERESTS_NOT_FOUND,
      );
    });

    test('유저의 프로필 정보를 의도대로 수정해야 한다', async () => {
      await handler.execute(command);

      expect(user.setProfile).toBeCalledTimes(1);
      expect(user.setProfile).toBeCalledWith({
        email,
        phone,
        homepage,
        languages,
        prefer,
      });
    });

    describe('관심 분야 수정', () => {
      test('기존에 설정되어 있는 유저의 관심 분야를 모두 삭제해야 한다', async () => {
        await handler.execute(command);

        expect(userInterestRepository.removeByUserId).toBeCalledTimes(1);
        expect(userInterestRepository.removeByUserId).toBeCalledWith(userId);
      });

      test('유저의 새로운 관심 분야를 모두 등록해야 한다', async () => {
        await handler.execute(command);

        const expected = Array.from({ length: interestIds.length }, (_, idx) =>
          userInterestFactory.create({
            id: newUserInterestIds[idx],
            interestId: interestIds[idx],
            userId,
          }),
        );

        expect(userInterestRepository.save).toBeCalledTimes(1);
        expect(userInterestRepository.save).toBeCalledWith(...expected);
      });
    });

    test('수정한 유저를 저장해야 한다', async () => {
      await handler.execute(command);

      expect(userRepository.save).toBeCalledTimes(1);
      expect(userRepository.save).toBeCalledWith(user);
    });

    test('수정한 유저를 반환해야 한다', async () => {
      const commandResult = await handler.execute(command);

      expect(commandResult).toEqual(new UpdateUserCommandResult(user));
    });
  });
});
