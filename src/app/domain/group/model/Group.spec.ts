import { GroupState } from '@sight/app/domain/group/model/constant';

import { DomainFixture } from '@sight/__test__/fixtures';

describe('Group', () => {
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
