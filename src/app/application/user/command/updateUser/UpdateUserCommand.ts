import { ICommand } from '@nestjs/cqrs';

export class UpdateUserCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly email: string,
    readonly phone: string | null,
    readonly homepage: string,
    readonly language: string,
    readonly interestIds: string[],
    readonly prefer: string,
  ) {}
}
