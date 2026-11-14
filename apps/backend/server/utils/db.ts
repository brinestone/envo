import { drizzle } from "drizzle-orm/node-postgres";
import { useRuntimeConfig } from "nitro/runtime-config";
import { Pool } from "pg";

let pool: Pool;

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
  });
}

export async function closeDatabase() {
  await pool.end();
}
