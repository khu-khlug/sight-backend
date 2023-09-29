import { User } from '@sight/app/domain/user/model/User';

export class UpdateUnitedUserCommandResult {
  constructor(readonly user: User) {}
}
