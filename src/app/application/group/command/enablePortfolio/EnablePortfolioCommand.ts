export class EnablePortfolioCommand {
  constructor(
    readonly groupId: string,
    readonly requesterUserId: number,
  ) {}
}
