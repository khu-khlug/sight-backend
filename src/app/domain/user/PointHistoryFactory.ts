import { Injectable } from '@nestjs/common';

import {
  PointHistory,
  PointHistoryConstructorParams,
} from '@sight/app/domain/user/model/PointHistory';

type PointHistoryCreateParams = Omit<
  PointHistoryConstructorParams,
  'createdAt'
>;
type PointHistoryReconstituteParams = PointHistoryConstructorParams;

@Injectable()
export class PointHistoryFactory {
  create(params: PointHistoryCreateParams): PointHistory {
    const now = new Date();
    return new PointHistory({ ...params, createdAt: now });
  }

  reconstitute(params: PointHistoryReconstituteParams): PointHistory {
    return new PointHistory(params);
  }
}
