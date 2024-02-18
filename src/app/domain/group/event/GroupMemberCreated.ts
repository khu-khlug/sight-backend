export class GroupMemberCreated {
  constructor(
    readonly groupId: string,
    readonly userId: string,
  ) {}
}
