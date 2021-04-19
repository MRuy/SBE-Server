import dotenv from 'dotenv';
import { Config } from './types/definitions';

// load .env if available, will not overwrite environment variables
dotenv.config();

export const config: Config = {
  web: {
    host: process.env.WEB_HOST ?? 'localhost',
    port: Number(process.env.WEB_PORT ?? 8080),
  },
  postgres: process.env.POSTGRES,
  defaultItemLimit: Number(process.env.DEFAULT_ITEM_LIMIT ?? 100),
};
