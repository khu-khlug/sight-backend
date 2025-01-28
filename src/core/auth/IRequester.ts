import { UserRole } from '@khlug/core/auth/UserRole';

export interface IRequester {
  userId: number;
  role: UserRole;
}
