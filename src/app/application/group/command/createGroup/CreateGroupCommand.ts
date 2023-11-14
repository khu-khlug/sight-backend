import { ICommand } from '@nestjs/cqrs';
import {
  GroupAccessGrade,
  GroupCategory,
} from '@sight/app/domain/group/model/constant';

export class CreateGroupCommand implements ICommand {
  constructor(
    readonly userId: string,
    readonly title: string,
    readonly category: GroupCategory,
    readonly grade: GroupAccessGrade,
    // TODO: 아이디어 관련 도메인이 추가된 후에 추가 구현 필요
    // readonly ideaId: string | null,
    readonly interestIds: string[],
    readonly purpose: string,
    readonly technology: string[],
    readonly allowJoin: boolean,
    readonly repository: string | null,
  ) {}
}
