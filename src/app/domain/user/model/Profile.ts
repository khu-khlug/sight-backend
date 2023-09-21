import { ValueObject } from '@sight/core/ddd/ValueObject';

export type ProfileConstructorParams = {
  name: string;
  college: string;
  grade: number;
  number: number | null;
  email: string | null;
  phone: string | null;
  homepage: string | null;
  languages: string[] | null;
  prefer: string | null;
};

export class Profile extends ValueObject {
  readonly name: string;
  readonly college: string;
  readonly grade: number;
  readonly number: number | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly homepage: string | null;
  readonly languages: string[] | null;
  readonly prefer: string | null;

  constructor(params: ProfileConstructorParams) {
    super();
    this.name = params.name;
    this.college = params.college;
    this.grade = params.grade;
    this.number = params.number;
    this.email = params.email;
    this.phone = params.phone;
    this.homepage = params.homepage;
    this.languages = params.languages;
    this.prefer = params.prefer;
  }
}
