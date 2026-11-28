import { drizzle } from "drizzle-orm/node-postgres";
import { useRuntimeConfig } from "nitro/runtime-config";
import { Pool } from "pg";
import { useLogger } from "./logging";

let pool: Pool;

const logger = useLogger();
export function usePool() {
  if (!pool) {
    initDb();
  }
  return pool;
}

export function initDb() {
  const { dbUrl } = useRuntimeConfig();
  pool = new Pool({ connectionString: dbUrl });
}

export function useDatabase() {
  return drizzle({
    client: pool,
    relations: {},
    logger: {
      logQuery: (query, params) => {
        if (!import.meta.dev || !logger.isDebugEnabled()) return;
        logger.debug(`query: ${query} -- params: ${params}`, "params", params);
      },
    },
  });
}

export async function closeDatabase() {
  await pool.end();
}
