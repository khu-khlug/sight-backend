import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { UserInterest } from '@khlug/app/domain/interest/model/UserInterest';
import { UserInterestFactory } from '@khlug/app/domain/interest/UserInterestFactory';

describe('UserInterestFactory', () => {
  let userInterestFactory: UserInterestFactory;

  const now = new Date();

  const userInterestId = 'userInterestId';
  const userId = 'userId';
  const interestId = 'interestId';
  const createdAt = now;

  beforeAll(async () => {
    advanceTo(now);

    const testModule = await Test.createTestingModule({
      providers: [UserInterestFactory],
    }).compile();

    userInterestFactory = testModule.get(UserInterestFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 유저 관심 분야를 생성해야 한다', () => {
      const expected = new UserInterest({
        id: userInterestId,
        userId,
        interestId,
        createdAt: now,
      });

      const result = userInterestFactory.create({
        id: userInterestId,
        userId,
        interestId,
      });

      expect(result).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    test('의도대로 유저 관심 분야를 재구성해야 한다', () => {
      const expected = new UserInterest({
        id: userInterestId,
        userId,
        interestId,
        createdAt,
      });

      const result = userInterestFactory.reconstitute({
        id: userInterestId,
        userId,
        interestId,
        createdAt,
      });

      expect(result).toEqual(expected);
    });
  });
});
