import { Group } from '@khlug/app/domain/group/model/Group';

export class ModifyGroupCommandResult {
  constructor(readonly group: Group) {}
}
