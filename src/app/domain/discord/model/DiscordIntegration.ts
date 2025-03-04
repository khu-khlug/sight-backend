import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export type DiscordIntegrationConstructorParams = {
  id: string;
  userId: number;
  discordUserId: string;
  createdAt: Date;
};

@Entity({ tableName: 'discord_integration' })
export class DiscordIntegration {
  @PrimaryKey({ type: 'varchar', length: 32, name: 'id' })
  @IsString()
  @IsNotEmpty()
  private _id: string;

  @Property({ type: 'int', name: 'user_id' })
  @Index({ name: 'idx_discord_int_user_id' })
  @IsString()
  @IsNotEmpty()
  private _userId: number;

  @Property({ type: 'varchar', length: 32, name: 'discord_user_id' })
  @Index({ name: 'idx_discord_int_discord_user_id' })
  @IsString()
  @IsNotEmpty()
  private _discordUserId: string;

  @Property({ name: 'created_at' })
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
