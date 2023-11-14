import { Group } from '@sight/app/domain/group/model/Group';

export class CreateGroupCommandResult {
  constructor(readonly group: Group) {}
}
