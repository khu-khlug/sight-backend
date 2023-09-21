import { AggregateRoot } from '@nestjs/cqrs';

export type InterestConstructorParams = {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
};

export class Interest extends AggregateRoot {
  private _id: string;
  private _name: string;
  private _description: string;
  private _createdAt: Date;

  constructor(params: InterestConstructorParams) {
    super();
    this._id = params.id;
    this._name = params.name;
    this._description = params.description;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
