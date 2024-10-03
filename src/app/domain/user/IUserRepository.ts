import { IGenericRepository } from '@khlug/core/persistence/IGenericRepository';

import { User } from '@khlug/app/domain/user/model/User';

export const UserRepository = Symbol('UserRepository');

export interface IUserRepository extends IGenericRepository<User> {
  findByIds: (ids: string[]) => Promise<User[]>;
}
