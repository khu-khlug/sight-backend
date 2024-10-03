import { InterestListView } from '@khlug/app/application/interest/query/view/InterestListView';

export const InterestQuery = Symbol('InterestQuery');

export interface IInterestQuery {
  listInterest(): Promise<InterestListView>;
}
