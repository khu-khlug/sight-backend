import { advanceTo, clear } from 'jest-date-mock';

import {
  CUSTOMER_SERVICE_GROUP_ID,
  GroupState,
} from '@sight/app/domain/group/model/constant';

import { DomainFixture } from '@sight/__test__/fixtures';

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
