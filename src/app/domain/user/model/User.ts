import {
  Embedded,
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { UnprocessableEntityException } from '@nestjs/common';
import { AggregateRoot } from '@nestjs/cqrs';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import dayjs from 'dayjs';

import { UserProfileUpdated } from '@khlug/app/domain/user/event/UserProfileUpdated';
import {
  StudentStatus,
  UserStatus,
} from '@khlug/app/domain/user/model/constant';
import { Profile } from '@khlug/app/domain/user/model/Profile';

import { Message } from '@khlug/constant/message';
import { UnivPeriod } from '@khlug/util/univPeriod';

export type UserConstructorParams = {
  id: number;
  name: string;
  password: string | null;
  profile: Profile;
  admission: string;
  studentStatus: StudentStatus;
  point: number;
  status: UserStatus;
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

// TODO: AggregateRoot 제거
@Entity({ tableName: 'khlug_members' })
export class User extends AggregateRoot {
  @PrimaryKey({ type: 'bigint', name: 'id' })
  @IsInt()
  @IsNotEmpty()
  private _id: number;

  @Property({ type: 'varchar', length: 127, name: 'name' })
  @Unique({ name: 'users_name_unique' })
  @IsString()
  @Length(1, 127)
  private _name: string;

  @Property({ type: 'varchar', length: 255, name: 'password', nullable: true })
  @IsString()
  @IsOptional()
  private _password: string | null;

  @Property({ type: 'char', length: 2, name: 'admission' })
  @IsString()
  @Length(2, 2)
  private _admission: string;

  @Property({ type: 'int', name: 'state' })
  @IsInt()
  private _studentStatus: StudentStatus;

  @Property({ type: 'int', name: 'expoint' })
  @IsInt()
  private _point: number;

  @Property({ type: 'tinyint', length: 1, name: 'active' })
  @IsBoolean()
  private _status: UserStatus;

  @Property({ type: 'tinyint', length: 1, name: 'manager' })
  @IsBoolean()
  private _manager: boolean;

  @Property({ type: 'varchar', length: 100, name: 'slack', nullable: true })
  @IsString()
  @IsOptional()
  private _slack: string | null;

  @Property({
    type: 'varchar',
    length: 100,
    name: 'remember_token',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  private _rememberToken: string | null;

  @Property({ type: 'timestamp', name: 'khuisauth_at' })
  @IsDate()
  private _khuisAuthAt: Date;

  @Property({ type: 'timestamp', name: 'return_at', nullable: true })
  @IsDate()
  @IsOptional()
  private _returnAt: Date | null;

  @Property({
    type: 'varchar',
    length: 191,
    name: 'return_reason',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  private _returnReason: string | null;

  @Property({
    type: 'timestamp',
    name: 'updated_at',
    onUpdate: () => new Date(),
  })
  @IsDate()
  private _updatedAt: Date;

  @Property({
    type: 'timestamp',
    name: 'created_at',
    onCreate: () => new Date(),
  })
  @IsDate()
  private _createdAt: Date;

  @Property({ type: 'timestamp', name: 'last_login' })
  @IsDate()
  private _lastLoginAt: Date;

  @Property({ type: 'timestamp', name: 'last_enter' })
  @IsDate()
  private _lastEnterAt: Date;

  @Embedded(() => Profile, { prefix: '' })
  private _profile: Profile;

  constructor(params: UserConstructorParams) {
    super();
    this._id = params.id;
    this._name = params.name;
    this._password = params.password;
    this._profile = params.profile;
    this._admission = params.admission;
    this._studentStatus = params.studentStatus;
    this._point = params.point;
    this._status = params.status;
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
      this.studentStatus === StudentStatus.UNITED
    ) {
      throw new UnprocessableEntityException(
        Message.UNITED_USER_CAN_ONLY_CHANGE_EMAIL,
      );
    }

    if (profile.phone && this.studentStatus !== StudentStatus.GRADUATE) {
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

  isStopped(): boolean {
    return this._returnAt !== null;
  }

  needAuth(): boolean {
    const checkTargetStudentStatus: StudentStatus[] = [
      StudentStatus.ABSENCE,
      StudentStatus.UNDERGRADUATE,
    ];

    const today = dayjs().tz('Asia/Seoul');
    const todayMMDD = today.format('MMDD');

    const khuisAuthAt = dayjs(this._khuisAuthAt).tz('Asia/Seoul');
    const khuisAuthAtMMDD = khuisAuthAt.format('MMDD');

    // 3월 2일부터 8월 31일까지를 1학기, 9월 1일부터 3월 1일까지를 2학기로 구분합니다.
    // 따라서, 3월 2일 이전 날짜는 전년도로 간주합니다.
    const currentYear = todayMMDD < '0302' ? today.year() - 1 : today.year();
    const currentSemester = todayMMDD >= '0302' && todayMMDD < '0901' ? 1 : 2;

    // 2월 20일부터 8월 20일까지를 1학기 인증 기간, 8월 21일부터 2월 19일까지를 2학기 인증 기간으로 구분합니다.
    // 따라서, 2월 20일 이전 날짜는 전년도로 간주합니다.
    const lastAuthYear =
      khuisAuthAtMMDD < '0220' ? khuisAuthAt.year() - 1 : khuisAuthAt.year();
    const lastAuthSemester =
      khuisAuthAtMMDD >= '0220' && khuisAuthAtMMDD < '0820' ? 1 : 2;

    const isTarget =
      checkTargetStudentStatus.includes(this._studentStatus) &&
      !this.isStopped();
    const authedInThisSemester =
      `${currentYear}-${currentSemester}` <=
      `${lastAuthYear}-${lastAuthSemester}`;

    return isTarget && !authedInThisSemester;
  }

  /**
   * 회비 납부 대상 여부
   * @see 회비에 관한 세부 회칙 제2조, 제5조
   */
  needPayFee(): boolean {
    // 정지 상태의 회원은 회비 납부 대상이 아닙니다.
    if (this.isStopped()) {
      return false;
    }

    // 재학 중이 아니면 회비 납부 대상이 아닙니다.
    if (this._studentStatus !== StudentStatus.UNDERGRADUATE) {
      return false;
    }

    // 운영진이면 회비 납부 대상이 아닙니다.
    if (this._manager) {
      return false;
    }

    let passedMinNeedPayFee = false;

    const nowPeriod = UnivPeriod.fromDate(this._createdAt);
    const thisSemester = UnivPeriod.fromDate(new Date()).toTerm();
    if (nowPeriod.inVacation()) {
      // 방학 중에 가입했다면, 다음 학기와 다다음 학기의 종강일을 지나야 2번의 종강일을 지남.
      // ex) 2024년 겨울방학에 가입했다면 2024년 2학기로 보므로, 2025년 1학기와 2025년 2학기를 지나야 함.
      const leastNeedPayTerm = nowPeriod.toTerm().next().next();
      passedMinNeedPayFee = thisSemester.isAfter(leastNeedPayTerm);
    } else {
      // 학기 중에 가입했다면, 다음 학기의 종강일을 지나야 2번의 종강일을 지남.
      // ex) 2024년 2학기에 가입했다면, 2024년 2학기와 2025년 1학기를 지나야 함.
      const leastNeedPayTerm = nowPeriod.toTerm().next();
      passedMinNeedPayFee = thisSemester.isAfter(leastNeedPayTerm);
    }

    const isGradeLessThanFour = this._profile.grade < 4;

    return !passedMinNeedPayFee || isGradeLessThanFour;
  }

  get id(): number {
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

  get studentStatus(): StudentStatus {
    return this._studentStatus;
  }

  get point(): number {
    return this._point;
  }

  get status(): UserStatus {
    return this._status;
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
