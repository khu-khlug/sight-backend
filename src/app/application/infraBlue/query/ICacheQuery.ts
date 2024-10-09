import { DoorLockPasswordView } from '@khlug/app/application/infraBlue/query/view/DoorLockPasswordView';

export const CacheQueryToken = Symbol('CacheQuery');

export interface ICacheQuery {
  getDoorLockPassword: () => Promise<DoorLockPasswordView>;
}
