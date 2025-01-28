import { ICommand } from '@nestjs/cqrs';

export class DisablePortfolioCommand implements ICommand {
  constructor(
    readonly groupId: string,
    readonly requesterUserId: number,
  ) {}
}
