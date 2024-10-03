import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { GroupMember } from '@khlug/app/domain/group/model/GroupMember';

export const GroupMemberRepository = Symbol('GroupMemberRepository');

export interface IGroupMemberRepository
  extends IGenericRepository<GroupMember, string> {
  findByGroupId: (groupId: string) => Promise<GroupMember[]>;
  findByGroupIdAndUserId: (
    groupId: string,
    userId: string,
  ) => Promise<GroupMember | null>;
}
