import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { openAPI, organization } from "better-auth/plugins";
import { defineMiddleware, HTTPError, type H3Event } from "nitro";
import { usePool } from "./db";
import {
  account,
  invitation,
  member,
  organization as organizationTable,
  session,
  user,
  verification,
} from "./db/auth";

export const auth = betterAuth({
  database: drizzleAdapter(usePool(), {
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
  baseURL: process.env.NITRO_DEPLOY_ORIGIN,
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 1,
      cancelPendingInvitationsOnReInvite: true,
      sendInvitationEmail: async ({ email, organization, role }) => {},
    }),
    openAPI({
      theme: "bluePlanet",
    }),
  ],
});

export const requireActiveOrg = defineMiddleware(async (event, next) => {
  if (event.context.auth && "member" in (event.context.auth as object)) {
    next();
    return;
  }
  const member = await auth.api.getActiveMember({ headers: event.req.headers });
  if (!member)
    throw HTTPError.status(403, "Forbidden", { message: "Please select an organization" });

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
  return event.context.auth as NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
}

export default auth;
