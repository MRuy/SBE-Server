import { Postgres } from './Postgres';
import { config } from '../config';

export const DB_OFFLINE_RESPONSE_OBJECT = {
  status: 'error',
  code: 'DATABASE_OFFLINE',
  msg: 'Database is offline',
};

const db: any = new Postgres(config.postgres);

(async _ => {
  await db.init();
})();

export {
  db,
};
