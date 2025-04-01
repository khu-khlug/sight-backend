import { advanceTo, clear } from 'jest-date-mock';

import { GroupState } from '@khlug/app/domain/group/model/constant';

import { GroupFixture } from '@khlug/__test__/fixtures/GroupFixture';
import { Message } from '@khlug/constant/error';

describe('Group', () => {
  beforeAll(() => {
    advanceTo(new Date());
  });

  afterAll(() => {
    clear();
  });

  describe('changeState', () => {
    test('상태를 변경해야 한다', () => {
      const group = GroupFixture.inProgressJoinable();
      const nextState = GroupState.END_SUCCESS;

      group.changeState(nextState);

      expect(group.state).toEqual(nextState);
      expect(group.updatedAt).toEqual(new Date());
    });
  });

  describe('wake', () => {
    test('그룹이 중단되어 있다면 진행 상태로 변경해야 한다', () => {
      const group = GroupFixture.suspended();

      group.wake();

      expect(group.state).toEqual(GroupState.PROGRESS);
    });
  });

  describe('enablePortfolio', () => {
    test('포트폴리오를 활성화해야 한다', () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: false });

      group.enablePortfolio();

      expect(group.hasPortfolio).toEqual(true);
    });

    test('이미 포트폴리오가 활성화되어 있다면 예외를 발생시켜야 한다', () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });

      expect(() => group.enablePortfolio()).toThrowError(
        Message.ALREADY_GROUP_ENABLED_PORTFOLIO,
      );
    });
  });

  describe('disablePortfolio', () => {
    test('포트폴리오를 비활성화해야 한다', () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: true });

      group.disablePortfolio();

      expect(group.hasPortfolio).toEqual(false);
    });

    test('이미 포트폴리오가 비활성화되어 있다면 예외를 발생시켜야 한다', () => {
      const group = GroupFixture.inProgressJoinable({ hasPortfolio: false });

      expect(() => group.disablePortfolio()).toThrowError(
        Message.ALREADY_GROUP_DISABLED_PORTFOLIO,
      );
    });
  });

  describe('isEditable', () => {
    test('그룹이 종료된 상태라면 false를 반환해야 한다', () => {
      const group = GroupFixture.successfullyEnd();

      expect(group.isEditable()).toEqual(false);
    });

    test('고객센터 그룹이라면 false를 반환해야 한다', () => {
      const group = GroupFixture.customerService();

      expect(group.isEditable()).toEqual(false);
    });
  });

  describe('isEnd', () => {
    test.each([GroupState.END_SUCCESS, GroupState.END_FAIL])(
      '그룹의 상태가 %s일 때, true를 반환해야 한다',
      (state: GroupState) => {
        const group = GroupFixture.raw({ state });
        expect(group.isEnd()).toEqual(true);
      },
    );
  });
});
