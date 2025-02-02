import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { IsDate, IsInt } from 'class-validator';

export type FeeHistoryConstructorParams = {
  id: number;
  year: number;
  semester: number;
  user: number;
  createdAt: Date;
};

@Entity({ tableName: 'khlug_members_fee' })
export class FeeHistory {
  @PrimaryKey({ type: 'int', name: 'id' })
  @IsInt()
  private _id: number;

  @Property({ type: 'int', name: 'year' })
  @IsInt()
  private _year: number;

  @Property({ type: 'int', name: 'semester' })
  @IsInt()
  private _semester: number;

  @Property({ type: 'bigint', name: 'user' })
  @IsInt()
  private _user: number;

  @Property({
    type: 'timestamp',
    name: 'created_at',
    onCreate: () => new Date(),
    onUpdate: () => new Date(),
  })
  @IsDate()
  private _createdAt: Date;

  constructor(params: FeeHistoryConstructorParams) {
    this._id = params.id;
    this._year = params.year;
    this._semester = params.semester;
    this._user = params.user;
    this._createdAt = params.createdAt;
  }

  get id(): number {
    return this._id;
  }

  get year(): number {
    return this._year;
  }

  get semester(): number {
    return this._semester;
  }

  get user(): number {
    return this._user;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
