import { User } from '@sight/app/domain/user/model/User';

export class UserProfileUpdated {
  constructor(readonly user: User) {}
}
