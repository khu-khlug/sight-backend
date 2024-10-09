import { IQueryResult } from '@nestjs/cqrs';

import { DoorLockPasswordView } from '@khlug/app/application/infraBlue/query/view/DoorLockPasswordView';

export class GetDoorLockPasswordQueryResult implements IQueryResult {
  constructor(readonly view: DoorLockPasswordView) {}
}
