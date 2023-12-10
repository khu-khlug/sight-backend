import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { GroupLog } from '@sight/app/domain/group/model/GroupLog';

export const GroupLogRepository = Symbol('GroupLogRepository');

export interface IGroupLogRepository
  extends IGenericRepository<GroupLog, string> {}
