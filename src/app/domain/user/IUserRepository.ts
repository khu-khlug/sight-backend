import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';

import { User } from '@sight/app/domain/user/model/User';

export const UserRepository = Symbol('UserRepository');

export interface IUserRepository extends IGenericRepository<User> {
  findByIds: (ids: string[]) => Promise<User[]>;
}
