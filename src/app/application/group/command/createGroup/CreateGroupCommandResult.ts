import { Group } from '@khlug/app/domain/group/model/Group';

export class CreateGroupCommandResult {
  constructor(readonly group: Group) {}
}
