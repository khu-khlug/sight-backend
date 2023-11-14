import { Inject } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';

import { Transactional } from '@sight/core/persistence/transaction/Transactional';

import { PointGranted } from '@sight/app/domain/user/event/PointGranted';
import { PointHistoryFactory } from '@sight/app/domain/user/PointHistoryFactory';
import {
  IPointHistoryRepository,
  PointHistoryRepository,
} from '@sight/app/domain/user/IPointHistoryRepository';

@EventsHandler(PointGranted)
export class PointGrantedHandler implements IEventHandler<PointGranted> {
  constructor(
    @Inject(PointHistoryFactory)
    private readonly pointHistoryFactory: PointHistoryFactory,
    @Inject(PointHistoryRepository)
    private readonly pointHistoryRepository: IPointHistoryRepository,
  ) {}

  @Transactional()
  async handle(event: PointGranted): Promise<void> {
    const { user, point, reason } = event;

    const newHistory = this.pointHistoryFactory.create({
      id: this.pointHistoryRepository.nextId(),
      userId: user.id,
      reason,
      point,
    });
    await this.pointHistoryRepository.save(newHistory);
  }
}
