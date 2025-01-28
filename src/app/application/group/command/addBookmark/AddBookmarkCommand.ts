export class AddBookmarkCommand {
  constructor(
    readonly groupId: string,
    readonly userId: number,
  ) {}
}
