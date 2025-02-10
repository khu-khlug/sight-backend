import { defineConfig } from '@mikro-orm/mysql';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { EntityModels } from '@khlug/core/persistence/Entities';

// mikro-orm CLI entrypoint 이므로 호출해주어야 정상적으로 실행될 수 있습니다.
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export default defineConfig({
  entities: EntityModels,
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'test',
  dbName: 'khlug',
});
