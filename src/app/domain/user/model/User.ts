import { UnprocessableEntityException } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';

import { UserProfileUpdated } from '@khlug/app/domain/user/event/UserProfileUpdated';
import { UserState } from '@khlug/app/domain/user/model/constant';
import { Profile } from '@khlug/app/domain/user/model/Profile';

import { Message } from '@khlug/constant/message';

export type UserConstructorParams = {
  id: string;
  name: string;
  password: string | null;
  profile: Profile;
  admission: string;
  state: UserState;
  point: number;
  active: boolean;
  manager: boolean;
  slack: string | null;
  rememberToken: string | null;
  khuisAuthAt: Date;
  returnAt: Date | null;
  returnReason: string | null;
  lastLoginAt: Date;
  lastEnterAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export class User extends AggregateRoot {
  private _id: string;
  private _name: string;
  private _password: string | null;
  private _profile: Profile;
  private _admission: string;
  private _state: UserState;
  private _point: number;
  private _active: boolean;
  private _manager: boolean;
  private _slack: string | null;
  private _rememberToken: string | null;
  private _khuisAuthAt: Date;
  private _returnAt: Date | null;
  private _returnReason: string | null;
  private _lastLoginAt: Date;
  private _lastEnterAt: Date;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(params: UserConstructorParams) {
    super();
    this._id = params.id;
    this._name = params.name;
    this._password = params.password;
    this._profile = params.profile;
    this._admission = params.admission;
    this._state = params.state;
    this._point = params.point;
    this._active = params.active;
    this._manager = params.manager;
    this._slack = params.slack;
    this._rememberToken = params.rememberToken;
    this._khuisAuthAt = params.khuisAuthAt;
    this._returnAt = params.returnAt;
    this._returnReason = params.returnReason;
    this._lastLoginAt = params.lastLoginAt;
    this._lastEnterAt = params.lastEnterAt;
    this._createdAt = params.createdAt;
    this._updatedAt = params.updatedAt;
  }

  setProfile(profile: Partial<Profile>): void {
    if (
      !(Object.keys(profile).length === 1 && profile.email) &&
      this.state === UserState.UNITED
    ) {
      throw new UnprocessableEntityException(
        Message.UNITED_USER_CAN_ONLY_CHANGE_EMAIL,
      );
    }

    if (profile.phone && this.state !== UserState.GRADUATE) {
      throw new UnprocessableEntityException(
        Message.GRADUATED_USER_ONLY_CAN_CHANGE_EMAIL,
      );
    }

    this._profile = new Profile({ ...this._profile, ...profile });
    this._updatedAt = new Date();

    this.apply(new UserProfileUpdated(this));
  }

  login(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  grantPoint(point: number): void {
    this._point += point;
    this._updatedAt = new Date();
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get password(): string | null {
    return this._password;
  }

  get profile(): Profile {
    return this._profile;
  }

  get admission(): string {
    return this._admission;
  }

  get state(): UserState {
    return this._state;
  }

  get point(): number {
    return this._point;
  }

  get active(): boolean {
    return this._active;
  }

  get manager(): boolean {
    return this._manager;
  }

  get slack(): string | null {
    return this._slack;
  }

  get rememberToken(): string | null {
    return this._rememberToken;
  }

  get khuisAuthAt(): Date {
    return this._khuisAuthAt;
  }

  get returnAt(): Date | null {
    return this._returnAt;
  }

  get returnReason(): string | null {
    return this._returnReason;
  }

  get lastLoginAt(): Date {
    return this._lastLoginAt;
  }

  get lastEnterAt(): Date {
    return this._lastEnterAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
