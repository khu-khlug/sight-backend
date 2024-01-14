import { UserRole } from '@sight/core/auth/UserRole';

export interface IRequester {
  userId: string;
  role: UserRole;
}
