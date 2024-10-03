import * as db from '@khlug/core/config/DatabaseConfig';
import * as session from '@khlug/core/config/LaravelSessionConfig';

export const configuration = (): {
  database: db.DatabaseConfig;
  session: session.LaravelSessionConfig;
} => ({
  database: db.config(),
  session: session.config(),
});
