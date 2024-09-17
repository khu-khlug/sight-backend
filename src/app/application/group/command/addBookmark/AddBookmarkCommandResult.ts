import { GroupBookmark } from '@sight/app/domain/group/model/GroupBookmark';

export class AddBookmarkCommandResult {
  constructor(readonly bookmark: GroupBookmark) {}
}
