import { defineConfig } from "drizzle-kit";
const dbURL = new URL(process.env.NITRO_DATABASE_URL);

export default defineConfig({
  dialect: "postgresql",
  schema: "./server/utils/db-schema.ts",
  out: "./server/migrations",
  dbCredentials: {
    url: dbURL.toString(),
    ssl: dbURL.searchParams.has("sslmode", "require"),
  },
});
