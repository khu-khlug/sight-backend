import { AggregateRoot } from '@nestjs/cqrs';

import { GroupCardState } from '@khlug/app/domain/group/model/constant';

export type GroupCardConstructorParams = {
  id: string;
  listId: string;
  order: number;
  name: string;
  authorUserId: string;
  description: string;
  labels: number;
  state: GroupCardState;
  inPortfolio: boolean;
  from: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class GroupCard extends AggregateRoot {
  private _id: string;

  private _listId: string;

  private _order: number;

  private _name: string;

  private _authorUserId: string;

  private _description: string;

  // TODO[lery]: 현재 구조는 비트마스킹으로 되어 있음.
  //             이후 리팩토링 혹은 비트마스킹을 사용하더라도 가독성이 높도록 수정
  //             각 색깔마다 상수를 만들고 Bit AND 연산을 처리한다던지?
  private _labels: number;

  private _state: GroupCardState;

  private _inPortfolio: boolean;

  // TODO[lery]: 현재 구조는 `${groupId}#${cardId}인 것으로 보임
  //             예외 없는지 확인 후 리팩토링 필요
  private _from: string | null;

  private _createdAt: Date;

  private _updatedAt: Date;

  constructor(params: GroupCardConstructorParams) {
    super();
    this._id = params.id;
    this._listId = params.listId;
    this._order = params.order;
    this._name = params.name;
    this._authorUserId = params.authorUserId;
    this._description = params.description;
    this._labels = params.labels;
    this._state = params.state;
    this._inPortfolio = params.inPortfolio;
    this._from = params.from;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get listId(): string {
    return this._listId;
  }

  get order(): number {
    return this._order;
  }

  get name(): string {
    return this._name;
  }

  get authorUserId(): string {
    return this._authorUserId;
  }

  get description(): string {
    return this._description;
  }

  get labels(): number {
    return this._labels;
  }

  get state(): GroupCardState {
    return this._state;
  }

  get inPortfolio(): boolean {
    return this._inPortfolio;
  }

  get from(): string | null {
    return this._from;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
