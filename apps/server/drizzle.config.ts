import { defineConfig } from 'drizzle-kit';

const config = defineConfig({
    dialect: 'postgresql',
    out: './db/migrations',
    schema: './db/schema',
    dbCredentials: {
        url: process.env.DB_URL as string
    }
});

export default config;