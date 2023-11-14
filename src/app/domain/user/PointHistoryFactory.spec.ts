import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { PointHistory } from '@sight/app/domain/user/model/PointHistory';
import { PointHistoryFactory } from '@sight/app/domain/user/PointHistoryFactory';

describe('PointHistoryFactory', () => {
  let pointHistoryFactory: PointHistoryFactory;

  const now = new Date();

  const pointHistoryId = 'point-history-id';
  const userId = 'user-id';
  const reason = 'reason';
  const point = 10;
  const createdAt = now;

  beforeAll(async () => {
    advanceTo(now);

    const testModule = await Test.createTestingModule({
      providers: [PointHistoryFactory],
    }).compile();

    pointHistoryFactory = testModule.get(PointHistoryFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 포인트 이력을 생성해야 한다', () => {
      const expected = new PointHistory({
        id: pointHistoryId,
        userId,
        reason,
        point,
        createdAt: now,
      });

      const result = pointHistoryFactory.create({
        id: pointHistoryId,
        userId,
        reason,
        point,
      });

      expect(result).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    test('의도대로 포인트 이력을 재구성해야 한다', () => {
      const expected = new PointHistory({
        id: pointHistoryId,
        userId,
        reason,
        point,
        createdAt,
      });

      const result = pointHistoryFactory.reconstitute({
        id: pointHistoryId,
        userId,
        reason,
        point,
        createdAt,
      });

      expect(result).toEqual(expected);
    });
  });
});
