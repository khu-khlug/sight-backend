import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupAuthorizer } from '@sight/app/application/group/authorizer/GroupAuthorizer';

import { User } from '@sight/app/domain/user/model/User';
import {
  GroupAccessGrade,
  GroupCategory,
  ManagerOnlyGroupAccessGrade,
  ManagerOnlyGroupCategory,
} from '@sight/app/domain/group/model/constant';

import { DomainFixture } from '@sight/__test__/fixtures';
import { Message } from '@sight/constant/message';

describe('GroupAuthorizer', () => {
  let authorizer: GroupAuthorizer;

  beforeAll(async () => {
    advanceTo(new Date());

    const testModule = await Test.createTestingModule({
      providers: [GroupAuthorizer],
    }).compile();

    authorizer = testModule.get(GroupAuthorizer);
  });

  afterAll(() => {
    clear();
  });

  describe('createGroup', () => {
    let user: User;

    describe('운영진 유저라면', () => {
      beforeEach(() => {
        user = DomainFixture.generateUser({ manager: true });
      });

      test.each(Object.values(GroupCategory))(
        '%s 유형의 그룹을 만들 수 있어야 한다',
        (category: GroupCategory) => {
          expect(() =>
            authorizer.createGroup({
              user,
              category,
              grade: GroupAccessGrade.ALL,
            }),
          ).not.toThrow();
        },
      );

      test.each(Object.values(GroupAccessGrade))(
        '공개 범위 %s의 그룹을 만들 수 있어야 한다',
        (grade: GroupAccessGrade) => {
          expect(() =>
            authorizer.createGroup({
              user,
              category: GroupCategory.STUDY,
              grade,
            }),
          ).not.toThrow();
        },
      );
    });

    describe('일반 유저라면', () => {
      beforeEach(() => {
        user = DomainFixture.generateUser({ manager: false });
      });

      test.each(Object.values(ManagerOnlyGroupCategory))(
        '%s 유형의 그룹을 만들 때 예외가 발생해야 한다',
        (category: GroupCategory) => {
          expect(() =>
            authorizer.createGroup({
              user,
              category,
              grade: GroupAccessGrade.ALL,
            }),
          ).toThrowError(Message.CANNOT_CREATE_GROUP);
        },
      );

      test.each(Object.values(ManagerOnlyGroupAccessGrade))(
        '공개 범위 %s의 그룹을 만들 때 예외가 발생해야 한다',
        (grade: GroupAccessGrade) => {
          expect(() =>
            authorizer.createGroup({
              user,
              category: GroupCategory.STUDY,
              grade,
            }),
          ).toThrowError(Message.CANNOT_CREATE_GROUP);
        },
      );
    });
  });
});
