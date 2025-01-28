import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { GroupBookmark } from '@khlug/app/domain/group/model/GroupBookmark';

export const GroupBookmarkRepository = Symbol('GroupBookmarkRepository');

export interface IGroupBookmarkRepository
  extends IGenericRepository<GroupBookmark, string> {
  findByGroupIdAndUserId: (
    groupId: string,
    userId: number,
  ) => Promise<GroupBookmark | null>;
}
