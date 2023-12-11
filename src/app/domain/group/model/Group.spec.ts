import {
  CUSTOMER_SERVICE_GROUP_ID,
  GroupState,
} from '@sight/app/domain/group/model/constant';

import { DomainFixture } from '@sight/__test__/fixtures';

describe('Group', () => {
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
