import * as db from '@sight/core/config/DatabaseConfig';
import * as session from '@sight/core/config/LaravelSessionConfig';

export const configuration = (): {
  database: db.DatabaseConfig;
  session: session.LaravelSessionConfig;
} => ({
  database: db.config(),
  session: session.config(),
});
