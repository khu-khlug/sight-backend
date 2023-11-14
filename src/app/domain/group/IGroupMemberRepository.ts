import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { GroupMember } from '@sight/app/domain/group/model/GroupMember';

export const GroupMemberRepository = Symbol('GroupMemberRepository');

export interface IGroupMemberRepository
  extends IGenericRepository<GroupMember, string> {}
