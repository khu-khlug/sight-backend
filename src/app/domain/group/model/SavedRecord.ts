import { AggregateRoot } from '@nestjs/cqrs';

export type FixedRecordConstructorParams = {
  id: string;
  userId: string;
  groupId: string;
  recordId: string;
  createdAt: Date;
};

export class FixedRecord extends AggregateRoot {
  private _id: string;
  private _userId: string;
  private _groupId: string;
  private _recordId: string;
  private _createdAt: Date;

  constructor(params: FixedRecordConstructorParams) {
    super();
    this._id = params.id;
    this._userId = params.userId;
    this._groupId = params.groupId;
    this._recordId = params.recordId;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get groupId(): string {
    return this._groupId;
  }

  get recordId(): string {
    return this._recordId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
