import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { UserInterest } from '@sight/app/domain/interest/model/UserInterest';

export const UserInterestRepository = Symbol('UserInterestRepository');

export interface IUserInterestRepository
  extends IGenericRepository<UserInterest> {
  getInterestsByUserId: (userId: string) => Promise<UserInterest>;
  removeByUserId: (userId: string) => Promise<void>;
}
