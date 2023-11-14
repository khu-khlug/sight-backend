import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { Group } from '@sight/app/domain/group/model/Group';

export const GroupRepository = Symbol('GroupRepository');

export interface IGroupRepository extends IGenericRepository<Group, string> {}
