import { IGenericRepository } from '@sight/core/persistence/IGenericRepository';
import { User } from './model/User';

export const UserRepository = Symbol('UserRepository');

export interface IUserRepository extends IGenericRepository<User> {}
