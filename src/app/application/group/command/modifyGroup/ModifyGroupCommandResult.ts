import { Group } from '@sight/app/domain/group/model/Group';

export class ModifyGroupCommandResult {
  constructor(readonly group: Group) {}
}
