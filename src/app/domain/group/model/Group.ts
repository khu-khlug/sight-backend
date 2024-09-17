import { UnprocessableEntityException } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';

import {
  CUSTOMER_SERVICE_GROUP_ID,
  GroupAccessGrade,
  GroupCategory,
  GroupState,
  PRACTICE_GROUP_ID,
} from '@sight/app/domain/group/model/constant';
import { Message } from '@sight/constant/message';

export type GroupConstructorParams = {
  id: string;
  category: GroupCategory;
  state: GroupState;
  title: string;
  authorUserId: string;
  adminUserId: string;
  purpose: string | null;
  interestIds: string[];
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
  private _interestIds: string[];
  private _technology: string[];
  private _grade: GroupAccessGrade;
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
    this._interestIds = params.interestIds;
    this._technology = params.technology;
    this._grade = params.grade;
    this._lastUpdaterUserId = params.lastUpdaterUserId;
    this._repository = params.repository;
    this._allowJoin = params.allowJoin;
    this._hasPortfolio = params.hasPortfolio;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  updateTitle(title: string): void {
    this._title = title;
    this._updatedAt = new Date();
    this.wake();
  }

  updatePurpose(purpose: string | null): void {
    this._purpose = purpose;
    this._updatedAt = new Date();
    this.wake();
  }

  updateInterestIds(interestIds: string[]): void {
    this._interestIds = Array.from(new Set(interestIds));
    this._updatedAt = new Date();
    this.wake();
  }

  updateTechnology(technology: string[]): void {
    this._technology = technology;
    this._updatedAt = new Date();
    this.wake();
  }

  updateGrade(grade: GroupAccessGrade): void {
    this._grade = grade;
    this._updatedAt = new Date();
    this.wake();
  }

  updateRepository(repository: string | null): void {
    this._repository = repository;
    this._updatedAt = new Date();
    this.wake();
  }

  updateAllowJoin(allowJoin: boolean): void {
    this._allowJoin = allowJoin;
    this._updatedAt = new Date();
    this.wake();
  }

  updateCategory(category: GroupCategory): void {
    this._category = category;
    this._updatedAt = new Date();
    this.wake();
  }

  changeState(nextState: GroupState) {
    this._state = nextState;
    this._updatedAt = new Date();
  }

  wake(): void {
    if (this._state === GroupState.SUSPEND) {
      this._state = GroupState.PROGRESS;
      this._updatedAt = new Date();
    }
  }

  enablePortfolio(): void {
    if (this._hasPortfolio) {
      throw new UnprocessableEntityException(
        Message.ALREADY_GROUP_ENABLED_PORTFOLIO,
      );
    }

    this._hasPortfolio = true;
    this._updatedAt = new Date();
  }

  disablePortfolio(): void {
    if (!this._hasPortfolio) {
      throw new UnprocessableEntityException(
        Message.ALREADY_GROUP_DISABLED_PORTFOLIO,
      );
    }

    this._hasPortfolio = false;
    this._updatedAt = new Date();
  }

  isEditable(): boolean {
    return !this.isEnd() && !this.isCustomerServiceGroup();
  }

  isEnd(): boolean {
    return (
      this.state === GroupState.END_FAIL ||
      this.state === GroupState.END_SUCCESS
    );
  }

  isCustomerServiceGroup(): boolean {
    return this.id === CUSTOMER_SERVICE_GROUP_ID;
  }

  isPracticeGroup(): boolean {
    return this.id === PRACTICE_GROUP_ID;
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

  get interestIds(): string[] {
    return this._interestIds;
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
