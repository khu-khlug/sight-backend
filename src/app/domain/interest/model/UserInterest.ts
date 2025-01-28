import { AggregateRoot } from '@nestjs/cqrs';

export type UserInterestConstructorParams = {
  id: string;
  userId: number;
  interestId: string;
  createdAt: Date;
};

export class UserInterest extends AggregateRoot {
  private _id: string;
  private _userId: number;
  private _interestId: string;
  private _createdAt: Date;

  constructor(params: UserInterestConstructorParams) {
    super();
    this._id = params.id;
    this._userId = params.userId;
    this._interestId = params.interestId;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get interestId(): string {
    return this._interestId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
