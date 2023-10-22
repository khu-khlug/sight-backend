import { AggregateRoot } from '@nestjs/cqrs';

export type SeminarRegistrationConstructorParams = {
  id: string;
  groupId: string;
  seminarId: string;
  createdAt: Date;
};

export class SeminarRegistration extends AggregateRoot {
  private _id: string;
  private _groupId: string;
  private _seminarId: string;
  private _createdAt: Date;

  constructor(params: SeminarRegistrationConstructorParams) {
    super();
    this._id = params.id;
    this._groupId = params.groupId;
    this._seminarId = params.seminarId;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get groupId(): string {
    return this._groupId;
  }

  get seminarId(): string {
    return this._seminarId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
