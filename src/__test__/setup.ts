import { chmodSync, existsSync, rmSync, writeFileSync } from 'fs';

const path = './src/__test__/test.sqlite3';

if (existsSync(path)) {
  rmSync(path);
}

writeFileSync(path, '');
chmodSync(path, 0o666);
