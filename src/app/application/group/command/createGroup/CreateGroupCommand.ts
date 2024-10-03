import { ICommand } from '@nestjs/cqrs';

import {
  GroupAccessGrade,
  GroupCategory,
} from '@khlug/app/domain/group/model/constant';

import { Typeof } from '@khlug/util/types';

export class CreateGroupCommand implements ICommand {
  readonly requesterUserId: string;
  readonly title: string;
  readonly category: GroupCategory;
  readonly grade: GroupAccessGrade;
  // TODO: 아이디어 관련 도메인이 추가된 후에 추가 구현 필요
  // readonly ideaId: string | null;
  readonly interestIds: string[];
  readonly purpose: string;
  readonly technology: string[];
  readonly allowJoin: boolean;
  readonly repository: string | null;

  constructor(params: Typeof<CreateGroupCommand>) {
    this.requesterUserId = params.requesterUserId;
    this.title = params.title;
    this.category = params.category;
    this.grade = params.grade;
    this.interestIds = params.interestIds;
    this.purpose = params.purpose;
    this.technology = params.technology;
    this.allowJoin = params.allowJoin;
    this.repository = params.repository;
  }
}
