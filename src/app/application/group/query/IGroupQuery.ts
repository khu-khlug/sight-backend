import { GroupListQueryType } from '@sight/app/application/group/query/listGroup/ListGroupQuery';
import { GroupListView } from '@sight/app/application/group/query/view/GroupListView';
import { GroupMemberListView } from '@sight/app/application/group/query/view/GroupMemberListView';

type ListGroupParams = {
  queryType: GroupListQueryType;
  keyword: string | null;
  interestId: string | null;
  limit: number;
  offset: number;
};

type ListGroupMemberParams = {
  groupId: string;
  limit: number;
  offset: number;
};

export const GroupQuery = Symbol('GroupQuery');

export interface IGroupQuery {
  listGroup: (params: ListGroupParams) => Promise<GroupListView>;
  listGroupMember: (
    params: ListGroupMemberParams,
  ) => Promise<GroupMemberListView>;
}
