import * as app from '@khlug/core/config/AppConfig';
import * as auth from '@khlug/core/config/AuthConfig';
import * as db from '@khlug/core/config/DatabaseConfig';
import * as discord from '@khlug/core/config/DiscordConfig';

export const configuration = (): {
  app: app.AppConfig;
  auth: auth.AuthServiceConfig;
  database: db.DatabaseConfig;
  discord: discord.DiscordConfig;
} => ({
  app: app.config(),
  auth: auth.config(),
  database: db.config(),
  discord: discord.config(),
});
