import * as app from '@khlug/core/config/AppConfig';
import * as db from '@khlug/core/config/DatabaseConfig';
import * as discord from '@khlug/core/config/DiscordConfig';
import * as session from '@khlug/core/config/LaravelSessionConfig';

export const configuration = (): {
  app: app.AppConfig;
  database: db.DatabaseConfig;
  discord: discord.DiscordConfig;
  session: session.LaravelSessionConfig;
} => ({
  app: app.config(),
  database: db.config(),
  discord: discord.config(),
  session: session.config(),
});
