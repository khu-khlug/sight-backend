import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { Interest } from '@khlug/app/domain/interest/model/Interest';

export const InterestRepository = Symbol('InterestRepository');

export interface IInterestRepository extends IGenericRepository<Interest> {
  findByIds: (interestIds: string[]) => Promise<Interest[]>;
}
