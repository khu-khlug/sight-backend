import { InterestView } from '@khlug/app/application/interest/query/view/InterestView';

export interface InterestListView {
  count: number;
  interests: InterestView[];
}
