import { Group } from '@sight/app/domain/group/model/Group';

export class GroupCreated {
  constructor(readonly group: Group) {}
}
