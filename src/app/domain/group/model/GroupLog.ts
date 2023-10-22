import { AggregateRoot } from '@nestjs/cqrs';

export type GroupLogConstructorParams = {
  id: string;
  groupId: string;
  userId: string;
  message: string;
  createdAt: Date;
};

export class GroupLog extends AggregateRoot {
  private _id: string;
  private _groupId: string;
  private _userId: string;
  private _message: string;
  private _createdAt: Date;

  constructor(params: GroupLogConstructorParams) {
    super();
    this._id = params.id;
    this._groupId = params.groupId;
    this._userId = params.userId;
    this._message = params.message;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get groupId(): string {
    return this._groupId;
  }

  get userId(): string {
    return this._userId;
  }

  get message(): string {
    return this._message;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
