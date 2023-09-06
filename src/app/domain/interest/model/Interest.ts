export type InterestConstructorParams = {
  id: number;
  name: string;
  description: string;
  createdAt: Date;
};

export class Interest {
  private _id: number;
  private _name: string;
  private _description: string;
  private _createdAt: Date;

  constructor(params: InterestConstructorParams) {
    this._id = params.id;
    this._name = params.name;
    this._description = params.description;
    this._createdAt = params.createdAt;
  }

  get id(): number {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
