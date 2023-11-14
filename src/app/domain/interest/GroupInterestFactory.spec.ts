import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupInterest } from '@sight/app/domain/interest/model/GroupInterest';
import { GroupInterestFactory } from '@sight/app/domain/interest/GroupInterestFactory';

describe('GroupInterestFactory', () => {
  let groupInterestFactory: GroupInterestFactory;

  const now = new Date();

  const groupInterestId = 'groupInterestId';
  const groupId = 'groupId';
  const interestId = 'interestId';
  const createdAt = now;

  beforeAll(async () => {
    advanceTo(now);

    const testModule = await Test.createTestingModule({
      providers: [GroupInterestFactory],
    }).compile();

    groupInterestFactory = testModule.get(GroupInterestFactory);
  });

  afterAll(() => {
    clear();
  });

  describe('create', () => {
    test('의도대로 그룹 관심 분야를 생성해야 한다', () => {
      const expected = new GroupInterest({
        id: groupInterestId,
        groupId,
        interestId,
        createdAt: now,
      });

      const result = groupInterestFactory.create({
        id: groupInterestId,
        groupId,
        interestId,
      });

      expect(result).toEqual(expected);
    });
  });

  describe('reconstitute', () => {
    test('의도대로 그룹 관심 분야를 재구성해야 한다', () => {
      const expected = new GroupInterest({
        id: groupInterestId,
        groupId,
        interestId,
        createdAt,
      });

      const result = groupInterestFactory.reconstitute({
        id: groupInterestId,
        groupId,
        interestId,
        createdAt,
      });

      expect(result).toEqual(expected);
    });
  });
});
