import { AggregateRoot } from '@nestjs/cqrs';

export interface IGenericRepository<
  T extends AggregateRoot,
  TIdentity = string,
> {
  nextId: () => TIdentity;
  findById: (id: TIdentity) => Promise<T | null>;
  save: (...domain: T[]) => Promise<void>;
  remove: (...domain: T[]) => Promise<void>;
}
