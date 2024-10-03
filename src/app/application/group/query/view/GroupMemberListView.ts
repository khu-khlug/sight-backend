import { GroupMemberView } from '@khlug/app/application/group/query/view/GroupMemberView';

export interface GroupMemberListView {
  count: number;
  groupMembers: GroupMemberView[];
}
