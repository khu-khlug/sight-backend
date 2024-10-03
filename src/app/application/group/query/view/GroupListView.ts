import { GroupView } from '@khlug/app/application/group/query/view/GroupView';

export interface GroupListView {
  count: number;
  groups: GroupView[];
}
