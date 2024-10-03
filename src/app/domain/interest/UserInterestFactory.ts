import { Injectable } from '@nestjs/common';

import {
  UserInterest,
  UserInterestConstructorParams,
} from '@khlug/app/domain/interest/model/UserInterest';

type UserInterestCreateParams = Omit<
  UserInterestConstructorParams,
  'createdAt'
>;
type UserInterestReconstituteParams = UserInterestConstructorParams;

@Injectable()
export class UserInterestFactory {
  create(params: UserInterestCreateParams): UserInterest {
    const now = new Date();
    return new UserInterest({ ...params, createdAt: now });
  }

  reconstitute(params: UserInterestReconstituteParams): UserInterest {
    return new UserInterest(params);
  }
}
