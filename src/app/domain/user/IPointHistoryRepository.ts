import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { PointHistory } from '@sight/app/domain/user/model/PointHistory';

export const PointHistoryRepository = Symbol('PointHistoryRepository');

export interface IPointHistoryRepository
  extends IGenericRepository<PointHistory, string> {}
