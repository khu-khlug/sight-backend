import { User } from '@khlug/app/domain/user/model/User';

export class UpdateUnitedUserCommandResult {
  constructor(readonly user: User) {}
}
