import { InterestListView } from '@sight/app/application/interest/query/view/InterestListView';

export interface IInterestQuery {
  listInterest(): Promise<InterestListView>;
}
