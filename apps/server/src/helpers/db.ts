import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg';
import * as users from '@schemas/user'

const pool = new Pool({
    connectionString: Bun.env.DB_URL,
    ssl: true
});

export function useUsersDb() {
    return drizzle(pool, { schema: { users } })
}