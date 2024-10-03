import { AggregateRoot } from '@nestjs/cqrs';

import { GroupRecordState } from '@khlug/app/domain/group/model/constant';

export type GroupRecordConstructorParams = {
  id: string;
  cardId: string;
  authorUserId: string;
  content: string | null;
  state: GroupRecordState;
  inPortfolio: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export class GroupRecord extends AggregateRoot {
  private _id: string;
  private _cardId: string;
  private _authorUserId: string;
  private _content: string | null;
  private _state: GroupRecordState;
  private _inPortfolio: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: GroupRecordConstructorParams) {
    super();
    this._id = params.id;
    this._cardId = params.cardId;
    this._authorUserId = params.authorUserId;
    this._content = params.content;
    this._state = params.state;
    this._inPortfolio = params.inPortfolio;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  get id(): string {
    return this._id;
  }

  get cardId(): string {
    return this._cardId;
  }

  get authorUserId(): string {
    return this._authorUserId;
  }

  get content(): string | null {
    return this._content;
  }

  get state(): GroupRecordState {
    return this._state;
  }

  get inPortfolio(): boolean {
    return this._inPortfolio;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
