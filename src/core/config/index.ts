import * as app from '@khlug/core/config/AppConfig';
import * as db from '@khlug/core/config/DatabaseConfig';
import * as session from '@khlug/core/config/LaravelSessionConfig';

export const configuration = (): {
  app: app.AppConfig;
  database: db.DatabaseConfig;
  session: session.LaravelSessionConfig;
} => ({
  app: app.config(),
  database: db.config(),
  session: session.config(),
});
