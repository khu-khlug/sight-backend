import { Injectable } from '@nestjs/common';

import {
  GroupBookmark,
  GroupBookmarkConstructorParams,
} from '@khlug/app/domain/group/model/GroupBookmark';

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
    return newBookmark;
  }

  reconstitute(params: GroupBookmarkReconstituteParams): GroupBookmark {
    return new GroupBookmark(params);
  }
}
