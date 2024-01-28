import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { GroupBookmark } from '@sight/app/domain/group/model/GroupBookmark';

export const GroupBookmarkRepository = Symbol('GroupBookmarkRepository');

export interface IGroupBookmarkRepository
  extends IGenericRepository<GroupBookmark, string> {
  findByGroupIdAndUserId: (
    groupId: string,
    userId: string,
  ) => Promise<GroupBookmark | null>;
}
