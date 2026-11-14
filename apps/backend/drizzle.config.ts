import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

const e = config();
expand(e);

const url = new URL(e.parsed?.NITRO_DB_URL as string);
export default defineConfig({
  dialect: "postgresql",
  out: "migrations",
  schema: ["server/utils/db/schema.ts", "server/utils/db/auth.ts"],
  dbCredentials: {
    url: url.toString(),
  },
});
