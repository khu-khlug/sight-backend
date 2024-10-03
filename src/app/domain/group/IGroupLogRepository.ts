import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { GroupLog } from '@khlug/app/domain/group/model/GroupLog';

export const GroupLogRepository = Symbol('GroupLogRepository');

export interface IGroupLogRepository
  extends IGenericRepository<GroupLog, string> {}
