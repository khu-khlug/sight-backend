import { AggregateRoot } from '@nestjs/cqrs';

export type PointHistoryConstructorParams = {
  id: string;
  userId: string;
  reason: string;
  point: number;
  createdAt: Date;
};

export class PointHistory extends AggregateRoot {
  private _id: string;
  private _userId: string;
  private _reason: string;
  private _point: number;
  private _createdAt: Date;

  constructor(params: PointHistoryConstructorParams) {
    super();

    this._id = params.id;
    this._userId = params.userId;
    this._reason = params.reason;
    this._point = params.point;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get reason(): string {
    return this._reason;
  }

  get point(): number {
    return this._point;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
