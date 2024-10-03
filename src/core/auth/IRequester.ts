import { UserRole } from '@khlug/core/auth/UserRole';

export interface IRequester {
  userId: string;
  role: UserRole;
}
