import {
  GroupCategory,
  GroupState,
} from '@khlug/app/domain/group/model/constant';

export interface GroupView {
  id: string;
  category: GroupCategory;
  state: GroupState;
  title: string;
  authorUserId: string;
  adminUserId: string;
  purpose: string | null;
  technology: string[];
  lastUpdaterUserId: string;
  repository: string | null;
  allowJoin: boolean;
  hasPortfolio: boolean;
  createdAt: Date;
  updatedAt: Date;
}
