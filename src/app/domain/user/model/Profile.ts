import { Embeddable, Property } from '@mikro-orm/core';
import { IsEmail, IsInt, IsOptional, IsString, Length } from 'class-validator';

export type ProfileConstructorParams = {
  name: string;
  college: string;
  grade: number;
  number: number | null;
  email: string | null;
  phone: string | null;
  homepage: string | null;
  language: string | null;
  prefer: string | null;
};

@Embeddable()
export class Profile {
  @Property({ type: 'varchar', length: 255, name: 'realname' })
  @IsString()
  @Length(1, 255)
  readonly name: string;

  @Property({ type: 'varchar', length: 255, name: 'college' })
  @IsString()
  @Length(1, 255)
  readonly college: string;

  @Property({ type: 'int', name: 'grade' })
  @IsInt()
  readonly grade: number;

  // TODO: 현재는 숫자 컬럼인데 문자열 컬럼으로 수정해야 함
  @Property({ type: 'int', name: 'number', nullable: true })
  @IsInt()
  @IsOptional()
  readonly number: number | null;

  @Property({ type: 'varchar', length: 255, name: 'email', nullable: true })
  @IsEmail()
  @IsOptional()
  readonly email: string | null;

  @Property({ type: 'varchar', length: 255, name: 'phone', nullable: true })
  @IsString()
  @IsOptional()
  readonly phone: string | null;

  @Property({ type: 'varchar', length: 255, name: 'homepage', nullable: true })
  @IsString()
  @IsOptional()
  readonly homepage: string | null;

  @Property({ type: 'varchar', length: 255, name: 'language', nullable: true })
  @IsString({ each: true })
  @IsOptional()
  readonly language: string | null;

  @Property({ type: 'varchar', length: 255, name: 'prefer', nullable: true })
  @IsString()
  @IsOptional()
  readonly prefer: string | null;

  constructor(params: ProfileConstructorParams) {
    this.name = params.name;
    this.college = params.college;
    this.grade = params.grade;
    this.number = params.number;
    this.email = params.email;
    this.phone = params.phone;
    this.homepage = params.homepage;
    this.language = params.language;
    this.prefer = params.prefer;
  }
}
