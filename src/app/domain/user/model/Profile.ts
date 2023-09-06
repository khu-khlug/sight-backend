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

export class Profile {
  private _name: string;
  private _college: string;
  private _grade: number;
  private _number: number | null;
  private _email: string | null;
  private _phone: string | null;
  private _homepage: string | null;
  private _language: string | null;
  private _prefer: string | null;

  constructor(params: ProfileConstructorParams) {
    this._name = params.name;
    this._college = params.college;
    this._grade = params.grade;
    this._number = params.number;
    this._email = params.email;
    this._phone = params.phone;
    this._homepage = params.homepage;
    this._language = params.language;
    this._prefer = params.prefer;
  }

  get name(): string {
    return this._name;
  }

  get college(): string {
    return this._college;
  }

  get grade(): number {
    return this._grade;
  }

  get number(): number | null {
    return this._number;
  }

  get email(): string | null {
    return this._email;
  }

  get phone(): string | null {
    return this._phone;
  }

  get homepage(): string | null {
    return this._homepage;
  }

  get language(): string | null {
    return this._language;
  }

  get prefer(): string | null {
    return this._prefer;
  }
}
