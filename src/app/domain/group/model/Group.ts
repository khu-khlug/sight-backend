import { AggregateRoot } from '@nestjs/cqrs';

import {
  GroupAccessGrade,
  GroupCategory,
  GroupState,
} from '@sight/app/domain/group/model/constant';

export type GroupConstructorParams = {
  id: string;
  category: GroupCategory;
  state: GroupState;
  title: string;
  authorUserId: string;
  adminUserId: string;
  purpose: string | null;
  technology: string[];
  grade: GroupAccessGrade;
  lastUpdaterUserId: string;
  repository: string | null;
  allowJoin: boolean;
  hasPortfolio: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class Group extends AggregateRoot {
  private _id: string;
  private _category: GroupCategory;
  private _state: GroupState;
  private _title: string;
  private _authorUserId: string;
  private _adminUserId: string; // 구 master
  private _purpose: string | null;
  private _technology: string[];
  private _grade: GroupAccessGrade; // 사용하는지 확인 후 제거
  private _lastUpdaterUserId: string;
  private _repository: string | null;
  private _allowJoin: boolean;
  private _hasPortfolio: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: GroupConstructorParams) {
    super();

    this._id = params.id;
    this._category = params.category;
    this._state = params.state;
    this._title = params.title;
    this._authorUserId = params.authorUserId;
    this._adminUserId = params.adminUserId;
    this._purpose = params.purpose;
    this._technology = params.technology;
    this._grade = params.grade;
    this._lastUpdaterUserId = params.lastUpdaterUserId;
    this._repository = params.repository;
    this._allowJoin = params.allowJoin;
    this._hasPortfolio = params.hasPortfolio;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  isEnd(): boolean {
    return (
      this.state === GroupState.END_FAIL ||
      this.state === GroupState.END_SUCCESS
    );
  }

  get id(): string {
    return this._id;
  }

  get category(): GroupCategory {
    return this._category;
  }

  get title(): string {
    return this._title;
  }

  get authorUserId(): string {
    return this._authorUserId;
  }

  get adminUserId(): string {
    return this._adminUserId;
  }

  get purpose(): string | null {
    return this._purpose;
  }

  get state(): GroupState {
    return this._state;
  }

  get technology(): string[] {
    return this._technology;
  }

  get allowJoin(): boolean {
    return this._allowJoin;
  }

  get grade(): GroupAccessGrade {
    return this._grade;
  }

  get lastUpdaterUserId(): string {
    return this._lastUpdaterUserId;
  }

  get repository(): string | null {
    return this._repository;
  }

  get hasPortfolio(): boolean {
    return this._hasPortfolio;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
