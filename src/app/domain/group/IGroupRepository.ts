import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { Group } from '@khlug/app/domain/group/model/Group';

export const GroupRepository = Symbol('GroupRepository');

export interface IGroupRepository extends IGenericRepository<Group, string> {}
