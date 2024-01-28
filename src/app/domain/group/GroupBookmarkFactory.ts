import { Injectable } from '@nestjs/common';

import { GroupBookmarkCreated } from '@sight/app/domain/group/event/GroupBookmarkCreated';
import {
  GroupBookmark,
  GroupBookmarkConstructorParams,
} from '@sight/app/domain/group/model/GroupBookmark';

type GroupBookmarkCreateParams = Omit<
  GroupBookmarkConstructorParams,
  'createdAt'
>;

type GroupBookmarkReconstituteParams = GroupBookmarkConstructorParams;

@Injectable()
export class GroupBookmarkFactory {
  create(params: GroupBookmarkCreateParams): GroupBookmark {
    const newBookmark = new GroupBookmark({
      ...params,
      createdAt: new Date(),
    });
    newBookmark.apply(new GroupBookmarkCreated(params.groupId, params.userId));
    return newBookmark;
  }

  reconstitute(params: GroupBookmarkReconstituteParams): GroupBookmark {
    return new GroupBookmark(params);
  }
}
