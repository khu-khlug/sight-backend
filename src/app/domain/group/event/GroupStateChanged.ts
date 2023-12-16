import { GroupState } from '@sight/app/domain/group/model/constant';

export class GroupStateChanged {
  constructor(
    readonly groupId: string,
    readonly prevState: GroupState,
    readonly nextState: GroupState,
  ) {}
}
