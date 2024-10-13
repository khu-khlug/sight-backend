import { Typeof } from '@khlug/util/types';

export class UpdateDoorLockPasswordCommand {
  readonly master: string;
  readonly forJajudy: string;
  readonly forFacilityTeam: string;

  constructor(params: Typeof<UpdateDoorLockPasswordCommand>) {
    this.master = params.master;
    this.forJajudy = params.forJajudy;
    this.forFacilityTeam = params.forFacilityTeam;
  }
}
