import { GroupState } from '@sight/app/domain/group/model/constant';

type ChangeGroupStateRequester = {
  userId: string;
  isManager: boolean;
};

export class ChangeGroupStateCommand {
  constructor(
    readonly requester: ChangeGroupStateRequester,
    readonly groupId: string,
    readonly nextState: GroupState,
  ) {}
}
