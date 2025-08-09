import { getTableName, is, Table } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.NITRO_DATABASE_URL ?? "",
});

const usedTablesPerKey: Record<string, string[]> = {};
const CACHE_KEY = 'redis' as const;

export function useDatabase<TSchema extends Record<string, unknown>>(
  schema: TSchema
) {
  return drizzle(pool, {
    schema,
    cache: {
      strategy: () => "explicit",
      get: async (key) => {
        const cachedData = await useStorage(CACHE_KEY).getItem(key);
        return (cachedData as any[]) ?? undefined;
      },
      put: async (key, value, tables, isTag, config) => {
        const ttl = config?.ex ?? 60;
        await useStorage(CACHE_KEY).setItem(key, value, { ttl });
        for (const table of tables) {
          const keys = usedTablesPerKey[table];
          if (!keys) usedTablesPerKey[table] = [key];
          else keys.push(key);
        }
      },
      onMutate: async ({ tags: tagSet, tables: tableSet }) => {
        const keysToDelete = new Set<string>();
        const tables = tableSet ? Array.isArray(tableSet) ? tableSet : [tableSet] : [];
        const tags = tagSet ? Array.isArray(tagSet) ? tagSet : [tagSet] : [];

        for (const table of tables) {
          const tableName = is(table, Table) ? getTableName(table) : (table as string);
          const keys = usedTablesPerKey[tableName] ?? [];
          keys.forEach(k => keysToDelete.add(k));
        }

        if (keysToDelete.size > 0 || tags.length > 0) {
          for (const tag of tags) {
            await useStorage(CACHE_KEY).del(tag);
          }

          for (const key of keysToDelete) {
            await useStorage(CACHE_KEY).del(key)
            for (const table of tables) {
              const tableName = is(table, Table) ? getTableName(table) : (table as string);
              usedTablesPerKey[tableName] = [];
            }
          }
        }
      }
    }
  });
}
