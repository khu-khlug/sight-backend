import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { GroupInterest } from '@sight/app/domain/interest/model/GroupInterest';

export const GroupInterestRepository = Symbol('GroupInterestRepository');

export interface IGroupInterestRepository
  extends IGenericRepository<GroupInterest, string> {}
