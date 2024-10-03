import { IQueryResult } from '@nestjs/cqrs';

import { InterestListView } from '@khlug/app/application/interest/query/view/InterestListView';

export class ListInterestQueryResult implements IQueryResult {
  constructor(readonly view: InterestListView) {}
}
