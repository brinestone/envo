import { defineRelations } from "drizzle-orm";
import * as auth from "./auth";
import * as schema from "./schema";

export const relations = defineRelations({ ...auth, ...schema }, (r) => ({
  user: {
    sessions: r.many.session(),
    accounts: r.many.account(),
  },
  session: {
    user: r.one.user({
      from: r.session.userId,
      to: r.user.id,
    }),
  },
  account: {
    user: r.one.user({
      from: r.account.userId,
      to: r.user.id,
    }),
  },
  organization: {
    members: r.many.member(),
    invitations: r.many.invitation(),
    projects: r.many.projects(),
    events: r.many.events(),
  },
  member: {
    organization: r.one.organization({
      from: r.member.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.member.userId,
      to: r.user.id,
    }),
    events: r.many.events(),
  },
  events: {
    organization: r.one.organization({
      from: r.events.organization,
      to: r.organization.id,
    }),
    triggerer: r.one.member({
      from: r.events.triggeredBy,
      to: r.member.id,
    }),
  },
  invitation: {
    organization: r.one.organization({
      from: r.invitation.organizationId,
      to: r.organization.id,
    }),
    user: r.one.user({
      from: r.invitation.inviterId,
      to: r.user.id,
    }),
  },
  projects: {
    organization: r.one.organization({
      from: r.projects.organization,
      to: r.organization.id,
    }),
    creator: r.one.member({
      from: r.projects.createdBy,
      to: r.member.id,
    }),
    deletedConfigs: r.many.configs({
      where: {
        deletedAt: { isNotNull: true },
      },
    }),
    activeConfigs: r.many.configs({
      where: {
        deletedAt: { isNull: true },
      },
    }),
  },
  configs: {
    project: r.one.projects({
      from: r.configs.project,
      to: r.projects.id,
    }),
  },
}));
