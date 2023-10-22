import { AggregateRoot } from '@nestjs/cqrs';

export type GroupInterestConstructorParams = {
  id: string;
  groupId: string;
  interestId: string;
  createdAt: Date;
};

export class GroupInterest extends AggregateRoot {
  private _id: string;
  private _groupId: string;
  private _interestId: string;
  private _createdAt: Date;

  constructor(params: GroupInterestConstructorParams) {
    super();
    this._id = params.id;
    this._groupId = params.groupId;
    this._interestId = params.interestId;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get groupId(): string {
    return this._groupId;
  }

  get interestId(): string {
    return this._interestId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
