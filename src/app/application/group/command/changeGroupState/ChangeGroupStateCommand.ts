import { GroupState } from '@khlug/app/domain/group/model/constant';

type ChangeGroupStateRequester = {
  userId: number;
  isManager: boolean;
};

export class ChangeGroupStateCommand {
  constructor(
    readonly requester: ChangeGroupStateRequester,
    readonly groupId: string,
    readonly nextState: GroupState,
  ) {}
}
