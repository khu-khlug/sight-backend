import { GroupBookmark } from '@khlug/app/domain/group/model/GroupBookmark';

export class AddBookmarkCommandResult {
  constructor(readonly bookmark: GroupBookmark) {}
}
