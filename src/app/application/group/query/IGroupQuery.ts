import { GroupListQueryType } from '@sight/app/application/group/query/listGroup/ListGroupQuery';
import { GroupListView } from '@sight/app/application/group/query/view/GroupListView';

type ListGroupParams = {
  queryType: GroupListQueryType;
  keyword: string | null;
  limit: number;
  offset: number;
};

export const GroupQuery = Symbol('GroupQuery');

export interface IGroupQuery {
  listGroup: (params: ListGroupParams) => Promise<GroupListView>;
}
