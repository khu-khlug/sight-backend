import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { PointHistory } from '@khlug/app/domain/user/model/PointHistory';

export const PointHistoryRepository = Symbol('PointHistoryRepository');

export interface IPointHistoryRepository
  extends IGenericRepository<PointHistory, string> {}
