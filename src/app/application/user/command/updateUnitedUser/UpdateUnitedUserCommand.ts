import { ICommand } from '@nestjs/cqrs';

export class UpdateUnitedUserCommand implements ICommand {
  constructor(
    readonly userId: number,
    readonly email: string,
  ) {}
}
