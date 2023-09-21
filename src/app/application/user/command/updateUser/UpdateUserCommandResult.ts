import { User } from '@sight/app/domain/user/model/User';

export class UpdateUserCommandResult {
  constructor(readonly user: User) {}
}
