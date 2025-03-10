import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg';
import * as schema from '@schemas/index'

export const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: true
});

export const db = drizzle(pool, { schema: { ...schema }, logger: true })
export type DrizzleDb = typeof db;