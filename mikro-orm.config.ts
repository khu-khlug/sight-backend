import { defineConfig } from '@mikro-orm/mysql';

import { EntityModels } from '@khlug/core/persistence/Entities';

export default defineConfig({
  entities: EntityModels,
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'test',
  dbName: 'khlug',
});
