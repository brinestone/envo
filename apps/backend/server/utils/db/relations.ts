import { defineRelations } from "drizzle-orm";
import { user } from "./user";
import { session } from "./session";
import { account, invitation, member } from "./auth";
import { configs, events, projects } from "./schema";
import { organization } from "./organization";

export const relations = defineRelations(
  {
    user,
    session,
    account,
    member,
    invitation,
    projects,
    events,
    organization,
    configs,
  },
  (r) => ({
    user: {
      sessions: r.many.session(),
      accounts: r.many.account(),
    },
    session: {
      user: r.one.user({
        from: r.session.userId,
        to: r.user.id,
      }),
      activeProject: r.one.projects({
        from: r.session.activeProjectId,
        to: r.projects.id,
        optional: true,
      }),
      activeOrganization: r.one.organization({
        from: r.session.activeOrganizationId,
        to: r.organization.id,
        optional: true,
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
      associatedOrganization: r.one.organization({
        from: r.events.organization,
        to: r.organization.id,
      }),
      triggerer: r.one.member({
        from: r.events.triggeredBy,
        to: r.member.id,
      }),
    },
    invitation: {
      associatedOrganization: r.one.organization({
        from: r.invitation.organizationId,
        to: r.organization.id,
      }),
      user: r.one.user({
        from: r.invitation.inviterId,
        to: r.user.id,
      }),
    },
    projects: {
      associatedOrganization: r.one.organization({
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
      associatedProject: r.one.projects({
        from: r.configs.project,
        to: r.projects.id,
      }),
    },
  }),
);
