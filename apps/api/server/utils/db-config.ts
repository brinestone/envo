import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NITRO_DATABASE_URL ?? "",
});

export function useDatabase<TSchema extends Record<string, unknown>>(
  schema: TSchema
) {
  return drizzle(pool, {
    schema,
    cache: upstashCache({
      url: "https://needed-dassie-17841.upstash.io",
      token: useRuntimeConfig().upstashToken,
    }),
  });
}
