import { advanceTo, clear } from 'jest-date-mock';

import {
  CUSTOMER_SERVICE_GROUP_ID,
  GroupState,
} from '@sight/app/domain/group/model/constant';

import { DomainFixture } from '@sight/__test__/fixtures';
import { Message } from '@sight/constant/message';

describe('Group', () => {
  beforeAll(() => {
    advanceTo(new Date());
  });

  afterAll(() => {
    clear();
  });

  describe('changeState', () => {
    const nextState = GroupState.PROGRESS;

    test('변경할 상태가 현재 그룹의 상태와 동일하다면 상태를 변경하지 않아야 한다', () => {
      const prev = new Date(2023, 7, 19, 0, 0, 0);
      const group = DomainFixture.generateGroup({
        state: nextState,
        updatedAt: prev,
      });

      group.changeState(nextState);

      expect(group.updatedAt).toEqual(prev);
    });

    test('상태를 변경해야 한다', () => {
      const prev = new Date(2023, 7, 19, 0, 0, 0);
      const group = DomainFixture.generateGroup({
        state: GroupState.PENDING,
        updatedAt: prev,
      });

      group.changeState(nextState);

      expect(group.state).toEqual(nextState);
      expect(group.updatedAt).toEqual(new Date());
    });
  });

  describe('wake', () => {
    test('그룹이 중단되어 있다면 진행 상태로 변경해야 한다', () => {
      const group = DomainFixture.generateGroup({
        state: GroupState.SUSPEND,
      });

      group.wake();

      expect(group.state).toEqual(GroupState.PROGRESS);
    });
  });

  describe('enablePortfolio', () => {
    test('포트폴리오를 활성화해야 한다', () => {
      const group = DomainFixture.generateGroup({
        hasPortfolio: false,
      });

      group.enablePortfolio();

      expect(group.hasPortfolio).toEqual(true);
    });

    test('이미 포트폴리오가 활성화되어 있다면 예외를 발생시켜야 한다', () => {
      const group = DomainFixture.generateGroup({
        hasPortfolio: true,
      });

      expect(() => group.enablePortfolio()).toThrowError(
        Message.ALREADY_GROUP_ENABLED_PORTFOLIO,
      );
    });
  });

  describe('disablePortfolio', () => {
    test('포트폴리오를 비활성화해야 한다', () => {
      const group = DomainFixture.generateGroup({
        hasPortfolio: true,
      });

      group.disablePortfolio();

      expect(group.hasPortfolio).toEqual(false);
    });

    test('이미 포트폴리오가 비활성화되어 있다면 예외를 발생시켜야 한다', () => {
      const group = DomainFixture.generateGroup({
        hasPortfolio: false,
      });

      expect(() => group.disablePortfolio()).toThrowError(
        Message.ALREADY_GROUP_DISABLED_PORTFOLIO,
      );
    });
  });

  describe('isEditable', () => {
    test('그룹이 종료된 상태라면 false를 반환해야 한다', () => {
      const group = DomainFixture.generateGroup({
        state: GroupState.END_SUCCESS,
      });

      expect(group.isEditable()).toEqual(false);
    });

    test('고객센터 그룹이라면 false를 반환해야 한다', () => {
      const group = DomainFixture.generateGroup({
        id: CUSTOMER_SERVICE_GROUP_ID,
      });

      expect(group.isEditable()).toEqual(false);
    });
  });

  describe('isEnd', () => {
    test.each([GroupState.END_SUCCESS, GroupState.END_FAIL])(
      '그룹의 상태가 %s일 때, true를 반환해야 한다',
      (state: GroupState) => {
        const group = DomainFixture.generateGroup({ state });
        expect(group.isEnd()).toEqual(true);
      },
    );
  });
});
