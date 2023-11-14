import { Injectable } from '@nestjs/common';

import {
  GroupInterest,
  GroupInterestConstructorParams,
} from '@sight/app/domain/interest/model/GroupInterest';

type GroupInterestCreateParams = Omit<
  GroupInterestConstructorParams,
  'createdAt'
>;
type GroupInterestReconstituteParams = GroupInterestConstructorParams;

@Injectable()
export class GroupInterestFactory {
  create(params: GroupInterestCreateParams): GroupInterest {
    const now = new Date();
    return new GroupInterest({ ...params, createdAt: now });
  }

  reconstitute(params: GroupInterestReconstituteParams): GroupInterest {
    return new GroupInterest(params);
  }
}
