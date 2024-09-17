import { Group } from '@sight/app/domain/group/model/Group';

export class ChangeGroupStateCommandResult {
  constructor(readonly group: Group) {}
}
