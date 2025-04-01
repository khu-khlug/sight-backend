import { Test } from '@nestjs/testing';
import { advanceTo, clear } from 'jest-date-mock';

import { GroupAuthorizer } from '@khlug/app/application/group/authorizer/GroupAuthorizer';

import {
  GroupAccessGrade,
  GroupCategory,
  ManagerOnlyGroupAccessGrade,
  ManagerOnlyGroupCategory,
} from '@khlug/app/domain/group/model/constant';
import { User } from '@khlug/app/domain/user/model/User';

import { DomainFixture } from '@khlug/__test__/fixtures';
import { Message } from '@khlug/constant/error';

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

  describe('authorizeForCreateGroup', () => {
    let user: User;

    describe('운영진 유저라면', () => {
      beforeEach(() => {
        user = DomainFixture.generateUser({ manager: true });
      });

      test.each(Object.values(GroupCategory))(
        '%s 유형의 그룹을 만들 수 있어야 한다',
        (category: GroupCategory) => {
          expect(() =>
            authorizer.authorizeForCreateGroup({
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
            authorizer.authorizeForCreateGroup({
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
            authorizer.authorizeForCreateGroup({
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
            authorizer.authorizeForCreateGroup({
              user,
              category: GroupCategory.STUDY,
              grade,
            }),
          ).toThrowError(Message.CANNOT_CREATE_GROUP);
        },
      );
    });
  });

  describe('authorizeForModifyGroup', () => {
    let user: User;

    describe('운영진 유저라면', () => {
      beforeEach(() => {
        user = DomainFixture.generateUser({ manager: true });
      });

      test.each(Object.values(GroupCategory))(
        '그룹을 %s 유형으로 수정할 수 있어야 한다',
        (category: GroupCategory) => {
          expect(() =>
            authorizer.authorizeForModifyGroup({
              user,
              nextCategory: category,
              nextGrade: GroupAccessGrade.ALL,
            }),
          ).not.toThrow();
        },
      );

      test.each(Object.values(GroupAccessGrade))(
        '그룹을 %s 공개 범위로 수정할 수 있어야 한다',
        (grade: GroupAccessGrade) => {
          expect(() =>
            authorizer.authorizeForModifyGroup({
              user,
              nextCategory: GroupCategory.STUDY,
              nextGrade: grade,
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
        '그룹을 %s 유형으로 수정할 때 예외가 발생해야 한다',
        (category: GroupCategory) => {
          expect(() =>
            authorizer.authorizeForModifyGroup({
              user,
              nextCategory: category,
              nextGrade: GroupAccessGrade.ALL,
            }),
          ).toThrowError(Message.CANNOT_MODIFY_GROUP);
        },
      );

      test.each(Object.values(ManagerOnlyGroupAccessGrade))(
        '그룹을 %s 공개 범위로 수정할 때 예외가 발생해야 한다',
        (grade: GroupAccessGrade) => {
          expect(() =>
            authorizer.authorizeForModifyGroup({
              user,
              nextCategory: GroupCategory.STUDY,
              nextGrade: grade,
            }),
          ).toThrowError(Message.CANNOT_MODIFY_GROUP);
        },
      );
    });
  });
});
