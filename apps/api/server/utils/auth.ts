
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { EventHandler, H3Event } from 'h3';
import { session } from './db-schema';

const db = drizzle(process.env.NITRO_DATABASE_URL, {
  schema: { user, account, session, verification, organizations, member, invitation }
});

const plugins = [
  organization(),
  // haveIBeenPwned(),
  // apiKey()
];
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: { enabled: true },
  plugins,
  trustedOrigins: [process.env.NITRO_FRONTEND_ORIGIN]
});

export const requireAuth: EventHandler = async (event: H3Event) => {
  const headers = event.headers;
  const session = await auth.api.getSession({ headers });
  if (!session) throw createError({
    statusCode: 401,
    statusMessage: 'Unauthorized'
  });

  event.context.auth = session;
}