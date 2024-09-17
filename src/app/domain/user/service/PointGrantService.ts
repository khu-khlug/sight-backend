import { Inject, Injectable } from '@nestjs/common';

import { PointHistoryFactory } from '@sight/app/domain/user/PointHistoryFactory';
import {
  IUserRepository,
  UserRepository,
} from '@sight/app/domain/user/IUserRepository';
import {
  IPointHistoryRepository,
  PointHistoryRepository,
} from '@sight/app/domain/user/IPointHistoryRepository';

@Injectable()
export class PointGrantService {
  constructor(
    @Inject(UserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(PointHistoryFactory)
    private readonly pointHistoryFactory: PointHistoryFactory,
    @Inject(PointHistoryRepository)
    private readonly pointHistoryRepository: IPointHistoryRepository,
  ) {}

  async grant(params: {
    targetUserIds: string[];
    amount: number;
    reason: string;
  }): Promise<void> {
    const { targetUserIds, amount, reason } = params;

    const users = await this.userRepository.findByIds(targetUserIds);
    users.forEach((user) => user.grantPoint(amount));

    const newHistories = users.map((user) =>
      this.pointHistoryFactory.create({
        id: this.pointHistoryRepository.nextId(),
        userId: user.id,
        reason,
        point: amount,
      }),
    );

    await this.userRepository.save(...users);
    await this.pointHistoryRepository.save(...newHistories);
  }
}
