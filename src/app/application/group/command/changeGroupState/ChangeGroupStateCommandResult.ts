import { GroupState } from '@sight/app/domain/group/model/constant';

export class ChangeGroupStateCommandResult {
  constructor(readonly nextState: GroupState) {}
}
