import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { openAPI, organization } from "better-auth/plugins";
import { defineMiddleware, HTTPError, type H3Event } from "nitro";
import { useDatabase } from "./db";
import { account, invitation, member, verification } from "./db/auth";
import { organization as organizationTable } from "./db/organization";
import { session } from "./db/session";
import { user } from "./db/user";

console.log(process.env.NITRO_CORS_ORIGINS);

export const auth = betterAuth({
  session: {
    additionalFields: {
      activeProjectId: {
        type: "string",
        required: false,
      },
    },
  },
  database: drizzleAdapter(useDatabase(), {
    schema: {
      user,
      session,
      account,
      verification,
      organization: organizationTable,
      member,
      invitation,
    },
    provider: "pg",
  }),
  trustedOrigins: process.env.NITRO_CORS_ORIGINS?.split(",") ?? [],
  baseURL: process.env.NITRO_DEPLOY_ORIGIN,
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 1,
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async () => {},
    }),
    openAPI({
      theme: "bluePlanet",
    }),
  ],
  emailAndPassword: { enabled: true, minPasswordLength: 6 },
  socialProviders: {
    google: {
      clientId: process.env.NITRO_GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.NITRO_GOOGLE_CLIENT_SECRET as string,
    },
  },
  advanced: {
    trustedProxyHeaders: !import.meta.dev,
    useSecureCookies: !import.meta.dev,
    ipAddress: {
      ipAddressHeaders: import.meta.dev
        ? undefined
        : ["cf-connecting-ip", "true-client-ip", "x-forwarded-for"],
    },
  },
});

export const requireActiveOrg = defineMiddleware(async (event, next) => {
  if (event.context.auth && "member" in (event.context.auth as object)) {
    next();
    return;
  }
  const member = await auth.api.getActiveMember({ headers: event.req.headers });
  if (!member)
    throw HTTPError.status(403, "Forbidden", {
      message: "Please select an organization",
    });

  event.context.auth = { ...(event.context.auth as object), member };
  next();
});

export const requireAuth = defineMiddleware(async (event, next) => {
  const session = await auth.api.getSession({ headers: event.req.headers });

  if (!session) {
    throw HTTPError.status(401, "Unauthorized");
  }

  event.context.auth = session;
  if (session.session.activeOrganizationId) {
    const member = await auth.api.getActiveMember({
      headers: event.req.headers,
    });
    event.context.auth = { member, ...session };
  }
  next();
});

export function useMembership(event: H3Event) {
  const { member } = event.context.auth as {
    member: Awaited<ReturnType<typeof auth.api.getActiveMember>>;
  };
  return member;
}

export function useAuth(event: H3Event) {
  return event.context.auth as NonNullable<
    Awaited<ReturnType<typeof auth.api.getSession>>
  >;
}

export default auth;
