import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { UserInterest } from '@khlug/app/domain/interest/model/UserInterest';

export const UserInterestRepository = Symbol('UserInterestRepository');

export interface IUserInterestRepository
  extends IGenericRepository<UserInterest> {
  getInterestsByUserId: (userId: number) => Promise<UserInterest>;
  removeByUserId: (userId: number) => Promise<void>;
}
