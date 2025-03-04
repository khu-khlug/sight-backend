import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export type DiscordIntegrationConstructorParams = {
  id: string;
  userId: number;
  discordUserId: string;
  createdAt: Date;
};

export class DiscordIntegration {
  @IsString()
  @IsNotEmpty()
  private _id: string;

  @IsString()
  @IsNotEmpty()
  private _userId: number;

  @IsString()
  @IsNotEmpty()
  private _discordUserId: string;

  @IsDate()
  private _createdAt: Date;

  constructor(params: DiscordIntegrationConstructorParams) {
    this._id = params.id;
    this._userId = params.userId;
    this._discordUserId = params.discordUserId;
    this._createdAt = params.createdAt;
  }

  get id(): string {
    return this._id;
  }

  get userId(): number {
    return this._userId;
  }

  get discordUserId(): string {
    return this._discordUserId;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
