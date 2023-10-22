import { AggregateRoot } from '@nestjs/cqrs';

import {
  SeminarSemester,
  SeminarState,
} from '@sight/app/domain/seminar/model/constant';

export type SeminarConstructorParams = {
  id: string;
  year: number;
  semester: SeminarSemester;
  state: SeminarState;
  createdAt: Date;
  updatedAt: Date;
};

export class Seminar extends AggregateRoot {
  private _id: string;
  private _year: number;
  private _semester: SeminarSemester;
  private _state: SeminarState;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: SeminarConstructorParams) {
    super();
    this._id = params.id;
    this._year = params.year;
    this._semester = params.semester;
    this._state = params.state;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get year(): number {
    return this._year;
  }

  get semester(): SeminarSemester {
    return this._semester;
  }

  get state(): SeminarState {
    return this._state;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
