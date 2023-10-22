import { AggregateRoot } from '@nestjs/cqrs';

export type GroupListConstructorParams = {
  id: string;
  groupId: string;
  order: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class GroupList extends AggregateRoot {
  private _id: string;
  private _groupId: string;
  private _order: number;
  private _name: string;
  private _description: string | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: GroupListConstructorParams) {
    super();
    this._id = params.id;
    this._groupId = params.groupId;
    this._order = params.order;
    this._name = params.name;
    this._description = params.description;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get groupId(): string {
    return this._groupId;
  }

  get order(): number {
    return this._order;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
