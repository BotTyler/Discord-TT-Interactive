import { Pool } from "pg";
import { logger } from "../logger/logger";
export default class Database {
  private static db: Pool | undefined = undefined;

  public static getInstance(): Pool {
    if (Database.db === undefined) {
      Database.db = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: +process.env.DB_PORT!,
      });
    }

    return Database.db;
  }

  async close() {
    try {
      Database.db?.end();
      Database.db = undefined;
    } catch (error) {
      logger.error({ err: error }, "Unexpected Error");
    }
  }
}
