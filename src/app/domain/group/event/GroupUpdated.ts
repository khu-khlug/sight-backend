export type GroupUpdatedItem =
  | 'title'
  | 'purpose'
  | 'interests'
  | 'technology'
  | 'grade'
  | 'repository'
  | 'allowJoin'
  | 'category';

export class GroupUpdated {
  constructor(
    readonly groupId: string,
    readonly updatedItem: GroupUpdatedItem,
  ) {}
}
