import { Inject, Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

import { IRequester } from '@sight/core/auth/IRequester';

import { GroupLogFactory } from '@sight/app/domain/group/GroupLogFactory';
import { IGroupLogger } from '@sight/app/domain/group/IGroupLogger';
import {
  GroupLogRepository,
  IGroupLogRepository,
} from '@sight/app/domain/group/IGroupLogRepository';

@Injectable()
export class GroupLogger implements IGroupLogger {
  constructor(
    private readonly clsService: ClsService,
    private readonly groupLogFactory: GroupLogFactory,
    @Inject(GroupLogRepository)
    private readonly groupLogRepository: IGroupLogRepository,
  ) {}

  async log(groupId: string, message: string): Promise<void> {
    const requester: IRequester = this.clsService.get('requester');

    const groupLog = this.groupLogFactory.create({
      id: this.groupLogRepository.nextId(),
      groupId,
      userId: requester.userId,
      message,
    });
    await this.groupLogRepository.save(groupLog);
  }
}
