import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { PointGrantedHandler } from '@sight/app/application/user/eventHandler/PointGrantedHandler';

import { PointGranted } from '@sight/app/domain/user/event/PointGranted';
import { PointHistory } from '@sight/app/domain/user/model/PointHistory';
import { User } from '@sight/app/domain/user/model/User';
import { PointHistoryFactory } from '@sight/app/domain/user/PointHistoryFactory';
import {
  IPointHistoryRepository,
  PointHistoryRepository,
} from '@sight/app/domain/user/IPointHistoryRepository';

import { DomainFixture } from '@sight/__test__/fixtures';

describe('PointGrantedHandler', () => {
  let handler: PointGrantedHandler;
  let pointHistoryFactory: jest.Mocked<PointHistoryFactory>;
  let pointHistoryRepository: jest.Mocked<IPointHistoryRepository>;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [
        PointGrantedHandler,
        { provide: PointHistoryFactory, useValue: {} },
        { provide: PointHistoryRepository, useValue: {} },
      ],
    }).compile();

    handler = testModule.get(PointGrantedHandler);
    pointHistoryFactory = testModule.get(PointHistoryFactory);
    pointHistoryRepository = testModule.get(PointHistoryRepository);
  });

  afterAll(() => {
    clear();
  });

  describe('handle', () => {
    let user: User;
    let pointHistory: PointHistory;
    let event: PointGranted;

    const point = 10;
    const reason = 'test';

    beforeEach(() => {
      user = DomainFixture.generateUser();
      pointHistory = DomainFixture.generatePointHistory();
      event = new PointGranted(user, point, reason);

      pointHistoryFactory.create = jest.fn().mockReturnValue(pointHistory);
      pointHistoryRepository.nextId = jest.fn().mockReturnValue('newId');

      pointHistoryRepository.save = jest.fn();
    });

    test('새로운 포인트 히스토리를 생성해서 저장해야 한다', async () => {
      await handler.handle(event);

      expect(pointHistoryFactory.create).toBeCalledTimes(1);

      expect(pointHistoryRepository.save).toBeCalledTimes(1);
      expect(pointHistoryRepository.save).toBeCalledWith(pointHistory);
    });
  });
});
