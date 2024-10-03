import { Injectable } from '@nestjs/common';

import {
  GroupLog,
  GroupLogConstructorParams,
} from '@khlug/app/domain/group/model/GroupLog';

type GroupLogCreateParams = Omit<GroupLogConstructorParams, 'createdAt'>;
type GroupLogReconstituteParams = GroupLogConstructorParams;

@Injectable()
export class GroupLogFactory {
  create(params: GroupLogCreateParams) {
    const now = new Date();
    return new GroupLog({ ...params, createdAt: now });
  }

  reconstitute(params: GroupLogReconstituteParams) {
    return new GroupLog(params);
  }
}
