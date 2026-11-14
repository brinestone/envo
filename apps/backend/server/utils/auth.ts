import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { openAPI, organization } from "better-auth/plugins";
import { usePool } from "./db";
import {
  account,
  invitation,
  member,
  session,
  user,
  verification,
  organization as organizationTable,
} from "./db/auth";

export default betterAuth({
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
