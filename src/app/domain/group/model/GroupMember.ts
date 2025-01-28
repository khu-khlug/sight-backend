import { AggregateRoot } from '@nestjs/cqrs';

export type GroupMemberConstructorParams = {
  id: string;
  userId: number;
  groupId: string;
  createdAt: Date;
};

export class GroupMember extends AggregateRoot {
  private _id: string;
  private _userId: number;
  private _groupId: string;
  private _createdAt: Date;

  constructor(params: GroupMemberConstructorParams) {
    super();
    this._id = params.id;
    this._userId = params.userId;
    this._groupId = params.groupId;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get groupId(): string {
    return this._groupId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
