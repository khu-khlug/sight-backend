export class GroupBookmarkRemoved {
  constructor(
    readonly groupId: string,
    readonly userId: string,
  ) {}
}
