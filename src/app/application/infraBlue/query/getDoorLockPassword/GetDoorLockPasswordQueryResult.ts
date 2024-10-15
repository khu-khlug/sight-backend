import { IQueryResult } from '@nestjs/cqrs';

import { Typeof } from '@khlug/util/types';

export class GetDoorLockPasswordQueryResult implements IQueryResult {
  master: string;
  forJajudy: string;
  forFacilityTeam: string;

  constructor(params: Typeof<GetDoorLockPasswordQueryResult>) {
    this.master = params.master;
    this.forJajudy = params.forJajudy;
    this.forFacilityTeam = params.forFacilityTeam;
  }
}
