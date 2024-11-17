import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { IsDate, IsInt, IsNotEmpty, IsString, Length } from 'class-validator';

import { ClassValidator } from '@khlug/util/validator/ClassValidator';

export type CacheConstructorParams = {
  id: number;
  name: string;
  content: string;
  updatedAt: Date;
};

export const CacheId = {
  masterPassword: 100,
  jajudyPassword: 101,
  facilityTeamPassword: 102,
};

// 흔히 사용되는 용어 "캐시"를 가리키는 것이 아님.
// 레거시 모델로써, 테이블로 만들기에는 데이터의 수가 상당히 적으나,
// 동적으로 변경되어야 하는 데이터들이 모여있는 테이블.
@Entity({ tableName: 'khlug_cache' })
export class Cache {
  @PrimaryKey({ type: 'int', length: 11, name: 'id' })
  @IsInt()
  @IsNotEmpty()
  private _id: number;

  @Property({ type: 'varchar', length: 255, name: 'name' })
  @IsString()
  @Length(1, 255)
  private _name: string;

  @Property({ type: 'longtext', name: 'content' })
  @IsString()
  private _content: string;

  @Property({ type: 'timestamp', name: 'updated_at' })
  @IsDate()
  private _updatedAt: Date;

  constructor(params: CacheConstructorParams) {
    this._id = params.id;
    this._name = params.name;
    this._content = params.content;
    this._updatedAt = params.updatedAt;

    ClassValidator.validate(this);
  }

  updateContent(content: string): void {
    this._content = content;
    this._updatedAt = new Date();
    ClassValidator.validate(this);
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get content(): string {
    return this._content;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
