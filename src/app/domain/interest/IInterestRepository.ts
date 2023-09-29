import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { Interest } from '@sight/app/domain/interest/model/Interest';

export const InterestRepository = Symbol('InterestRepository');

export interface IInterestRepository extends IGenericRepository<Interest> {
  findByIds: (interestIds: string[]) => Promise<Interest[]>;
}
