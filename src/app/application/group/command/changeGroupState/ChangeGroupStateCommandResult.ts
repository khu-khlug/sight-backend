import { Group } from '@khlug/app/domain/group/model/Group';

export class ChangeGroupStateCommandResult {
  constructor(readonly group: Group) {}
}
