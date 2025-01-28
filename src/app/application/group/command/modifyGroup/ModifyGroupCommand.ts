import { ICommand } from '@nestjs/cqrs';

import {
  GroupAccessGrade,
  GroupCategory,
} from '@khlug/app/domain/group/model/constant';

export type ModifyGroupParams = {
  readonly title: string;
  readonly purpose: string | null;
  readonly interestIds: string[];
  readonly technology: string[];
  readonly grade: GroupAccessGrade;
  readonly repository: string | null;
  readonly allowJoin: boolean;
  readonly category: GroupCategory;
};

export class ModifyGroupCommand implements ICommand {
  constructor(
    readonly groupId: string,
    readonly requesterUserId: number,
    readonly params: ModifyGroupParams,
  ) {}
}
