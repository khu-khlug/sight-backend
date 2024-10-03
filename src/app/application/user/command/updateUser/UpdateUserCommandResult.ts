import { User } from '@khlug/app/domain/user/model/User';

export class UpdateUserCommandResult {
  constructor(readonly user: User) {}
}
