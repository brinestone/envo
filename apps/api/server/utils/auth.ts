
import { generateRandomCode, generateUniqueName } from "@envo/common";
import { betterAuth, Session } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from 'better-auth/api';
import { organization as organizationPlugin } from "better-auth/plugins";
import { and, desc, eq, exists, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { EventHandler, H3Event } from 'h3';
import z from "zod";
import { AppSession, AppUser } from "~/types";
import { session } from './db-schema';
import { generateIdenticon } from "./identicon";

const db = drizzle(process.env.NITRO_DATABASE_URL, {
  schema: { apiKeys, user, account, session, verification, organization: organizations, member, invitation }
});

const plugins = [
  organizationPlugin({
    allowUserToCreateOrganization: true,
    teams: { enabled: false }
  }),
];
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      isServiceAccount: { type: 'boolean', defaultValue: false, required: false, input: false }
    }
  },
  databaseHooks: {
    session: {
      create: {
        before: async (newSession: AppSession, context) => {
          const [lastSession] = await db.select()
            .from(session)
            .where(and(
              eq(session.userId, newSession.userId),
              isNotNull(session.activeOrganizationId)
            ))
            .orderBy(desc(session.updatedAt))
            .limit(1);

          if (!lastSession) {
            await db.select()
              .from(member)
              .where(and(
                eq(member.userId, newSession.userId),
                eq(member.role, 'owner')
              )).then(([ownedOrg]) => newSession.activeOrganizationId = ownedOrg?.organizationId);
          }
          else
            newSession.activeOrganizationId = lastSession?.activeOrganizationId;

          return { data: { ...newSession } };
        }
      },
    },
    user: {
      create: {
        after: async (newUser, ctx) => {
          try {
            await db.transaction(async tx => {
              runAppTask('event:record', 'users.create', useEvent(), 'New user signed up');
              let logoUrl: string, png: Buffer<ArrayBufferLike>;
              png = generateIdenticon(Buffer.from(newUser.id));
              logoUrl = await uploadFile(png, newUser.id + '.png');
              await tx.update(user).set({ image: logoUrl }).where(eq(user.id, newUser.id));

              const slug = generateRandomCode(10);
              png = generateIdenticon(Buffer.from(String(Date.now()) + slug));
              logoUrl = await uploadFile(png, generateRandomCode(20) + '.png', 'image/png');

              const [org] = await tx.insert(organizations)
                .values({
                  name: generateUniqueName('capital'),
                  slug: generateRandomCode(10),
                  logo: logoUrl,
                  id: generateRandomCode(32)
                }).returning();

              await tx.insert(member)
                .values({
                  id: generateRandomCode(32),
                  organizationId: org.id,
                  role: 'owner',
                  userId: newUser.id
                });

              if (ctx.context.newSession) {
                await tx.update(session)
                  .set({ activeOrganizationId: org.id })
                  .where(eq(session.id, ctx.context.newSession.session.id));
                ctx.context.newSession.session.activeOrganizationId = org.id;
              }

              const svcName = 'Organization Service Account';
              const svcEmail = `${org.slug}.${Date.now()}.svc@envoservices.space`;
              const svcPassword = generateRandomCode(20);
              png = generateIdenticon(Buffer.from(svcName + svcEmail + svcPassword));
              logoUrl = await uploadFile(png, generateRandomCode(10) + '.png', 'image/png');
              const [serviceAccount] = await tx.insert(user)
                .values({
                  name: svcName,
                  image: logoUrl,
                  emailVerified: true,
                  isServiceAccount: true,
                  id: generateRandomCode(32),
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  email: svcEmail
                }).returning();
              await tx.insert(member)
                .values({
                  id: generateRandomCode(32),
                  organizationId: org.id,
                  role: 'admin',
                  userId: serviceAccount.id
                });
              runAppTask('event:record', 'users.create', undefined, 'New service account user created', {
                organization: org.id,
                id: serviceAccount.id
              });
            });
          } catch (e) {
            console.error(e);
            throw e;
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

  const membershipInfo = await auth.api.getActiveMember({ headers: event.headers });
  event.context.auth = { session: { ...session.session, activeMembership: membershipInfo?.id }, user: session.user };
}

export const requireOrgMembership: EventHandler = async (event: H3Event) => {
  const headers = event.headers;
  const { session: { activeOrganizationId: org } } = useAuth();
  if (!org) throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'Access denied. You must be in an active organization'
  });

  const orgMembership = await auth.api.getActiveMember({ headers });
  if (orgMembership.organizationId !== org) throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'Access denied. Unknown organization'
  })
}

export const requireProjectUnderOrg: (projectIdKey: string) => EventHandler = (projectIdKey: string) => async (event: H3Event) => {
  const headers = event.headers;
  const membership = await auth.api.getActiveMember({ headers });
  const { success, data } = await getValidatedRouterParams(event, z.object({ project: z.uuid() }).safeParse);
  if (!success) throw createError({
    statusCode: 400,
    statusText: 'Bad Request',
    message: 'Invalid Project ID'
  });

  const project = data.project;
  const db = useDatabase({ projects });
  const q = db.select().from(projects).where(and(eq(projects.id, project), eq(projects.organization, membership.organizationId)))
  const result = await db.select().from(projects).where(exists(q));
  if (result.length == 0) throw createError({
    statusCode: 403,
    statusMessage: 'Forbidden',
    message: 'Access denied. Project not found'
  })
}

export function useAuth(): { user: AppUser, session: AppSession } {
  return useEvent().context.auth as { session: Session & { activeOrganizationId?: string, activeMembership?: string }, user: AppUser };
}