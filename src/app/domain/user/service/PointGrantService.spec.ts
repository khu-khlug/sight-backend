import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { DomainFixture } from '@khlug/__test__/fixtures';

import {
  IPointHistoryRepository,
  PointHistoryRepository,
} from '../IPointHistoryRepository';
import { IUserRepository, UserRepository } from '../IUserRepository';
import { PointHistoryFactory } from '../PointHistoryFactory';
import { PointGrantService } from './PointGrantService';

describe('PointGrantService', () => {
  let pointGrantService: PointGrantService;
  let userRepository: jest.Mocked<IUserRepository>;
  let pointHistoryRepository: jest.Mocked<IPointHistoryRepository>;

  beforeAll(() => advanceTo(new Date()));

  beforeEach(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        PointGrantService,
        PointHistoryFactory,
        {
          provide: UserRepository,
          useValue: {
            findByIds: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: PointHistoryRepository,
          useValue: {
            nextId: jest.fn().mockImplementation(() => faker.string.uuid()),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    pointGrantService = testModule.get(PointGrantService);
    userRepository = testModule.get(UserRepository);
    pointHistoryRepository = testModule.get(PointHistoryRepository);
  });

  afterEach(() => clear());

  describe('grant', () => {
    test('주어진 유저에게 포인트를 부여해야 한다', async () => {
      const targetUserIds = [1, 2];
      const users = [
        DomainFixture.generateUser({ id: targetUserIds[0], point: 0 }),
        DomainFixture.generateUser({ id: targetUserIds[1], point: 0 }),
      ];
      const amount = 1000;

      userRepository.findByIds.mockResolvedValue(users);

      await pointGrantService.grant({
        targetUserIds,
        amount,
        reason: 'test',
      });

      expect(users[0].point).toBe(amount);
      expect(users[1].point).toBe(amount);
    });

    test('각 유저마다 포인트 이력을 생성해야 한다', async () => {
      const targetUserIds = [1, 2];
      const users = [
        DomainFixture.generateUser({ id: targetUserIds[0], point: 0 }),
        DomainFixture.generateUser({ id: targetUserIds[1], point: 0 }),
      ];
      const amount = 1000;
      const reason = 'test';

      userRepository.findByIds.mockResolvedValue(users);

      await pointGrantService.grant({
        targetUserIds,
        amount,
        reason,
      });

      expect(pointHistoryRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: users[0].id,
          reason,
          point: amount,
        }),
        expect.objectContaining({
          userId: users[1].id,
          reason,
          point: amount,
        }),
      );
    });
  });
});
