
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/node-postgres";
import { EventHandler, H3Event } from 'h3';
import { session } from './db-schema';
import { generateUniqueCode } from "./generators";
import { generateIdenticon } from "./identicon";

const db = drizzle(process.env.NITRO_DATABASE_URL, {
  schema: { user, account, session, verification, organizations, member, invitation }
});

const plugins = [
  organization({
    allowUserToCreateOrganization: false,
    teams: { enabled: false }
  }),
  // haveIBeenPwned(),
  // apiKey()
];
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: { enabled: true },
  databaseHooks: {
    user: {
      create: {
        after: async (user, ctx) => {
          try {
            await db.transaction(async tx => {
              const name = getUniqueRandomName();
              const slug = generateUniqueCode(10);
              const id = generateUniqueCode(20);
              const png = generateIdenticon(Buffer.from(name + slug));
              const logo = await uploadFile(png, id, 'image/png');
              const [{ org }] = await tx.insert(organizations)
                .values({
                  name,
                  logo,
                  slug,
                  id
                }).returning({ org: organizations.id });

              await tx.insert(member)
                .values({
                  id: generateUniqueCode(20),
                  organizationId: org,
                  role: 'owner',
                  userId: user.id
                });
            })
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  },
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