import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'discord_integration' })
export class DiscordIntegrationEntity {
  @PrimaryKey({ type: 'varchar', length: 32, name: 'id' })
  id!: string;

  @Property({ type: 'int', name: 'user_id' })
  @Index({ name: 'idx_discord_int_user_id' })
  userId!: number;

  @Property({ type: 'varchar', length: 32, name: 'discord_user_id' })
  @Index({ name: 'idx_discord_int_discord_user_id' })
  discordUserId!: string;

  @Property({ name: 'created_at' })
  createdAt!: Date;
}
