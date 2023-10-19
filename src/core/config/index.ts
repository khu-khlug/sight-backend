import * as db from '@sight/core/config/DatabaseConfig';

export const configuration = (): {
  database: db.DatabaseConfig;
} => ({
  database: db.config(),
});
