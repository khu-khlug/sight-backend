import { InterestView } from '@sight/app/application/interest/query/view/InterestView';

export interface InterestListView {
  count: number;
  interests: InterestView[];
}
