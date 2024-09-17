import { Injectable } from '@nestjs/common';

import {
  Group,
  GroupConstructorParams,
} from '@sight/app/domain/group/model/Group';

type GroupCreateParams = Omit<
  GroupConstructorParams,
  'hasPortfolio' | 'createdAt' | 'updatedAt'
>;
type GroupReconstituteParams = GroupConstructorParams;

@Injectable()
export class GroupFactory {
  create(params: GroupCreateParams): Group {
    const now = new Date();
    const newGroup = new Group({
      ...params,
      hasPortfolio: false,
      createdAt: now,
      updatedAt: now,
    });
    return newGroup;
  }

  reconstitute(params: GroupReconstituteParams): Group {
    return new Group(params);
  }
}
