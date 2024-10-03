import { User } from '@khlug/app/domain/user/model/User';

export class UserProfileUpdated {
  constructor(readonly user: User) {}
}
