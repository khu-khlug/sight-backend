import { AggregateRoot } from '@nestjs/cqrs';
import { GroupBookmarkRemoved } from '../event/GroupBookmarkRemoved';

export type GroupBookmarkConstructorParams = {
  id: string;
  userId: string;
  groupId: string;
  createdAt: Date;
};

export class GroupBookmark extends AggregateRoot {
  private _id: string;
  private _userId: string;
  private _groupId: string;
  private _createdAt: Date;

  constructor(params: GroupBookmarkConstructorParams) {
    super();
    this._id = params.id;
    this._userId = params.userId;
    this._groupId = params.groupId;
    this._createdAt = params.createdAt;
  }

  remove(): void {
    this.apply(new GroupBookmarkRemoved(this._id, this._userId));
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

  get createdAt(): Date {
    return this._createdAt;
  }
}
