import { boolean, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const projects = pgTable('projects', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    name: varchar().notNull(),
});

export const projectMemberRoles = pgEnum('project_member_roles', ['owner', 'member', 'admin']);
export const projectMemberships = pgTable('projects_memberships', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' }),
    role: projectMemberRoles().default('member'),
    revoked: boolean().default(false),
    user: text().default('deleted user').references(() => user.id, { onDelete: 'set default' })
});

export const environments = pgTable('environments', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    name: varchar().notNull(),
    enabled: boolean().default(true),
    project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' })
}, t => [
    uniqueIndex().on(t.name, t.project)
]);

export const configurations = pgTable('configurations', {
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    value: text().notNull(),
    secured: boolean().default(true),
    project: uuid().references(() => projects.id, { onDelete: 'set null' }),
}, t => [
    primaryKey({ columns: [t.name, t.environment] })
]);

export const features = pgTable('features', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    project: uuid().references(() => projects.id, { onDelete: 'set null' }),
    createdAt: timestamp().defaultNow(),
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' }),
    name: varchar().notNull(),
    enabled: boolean().default(true)
});

// export const projectDetails = pgView('vw_project_details').as(qb => {
//     return qb.select({
//         id: projectMemberships.id,
//         totalConfigurations: count(configurations).as('total_configurations'),
//         totalFeatures: count(features).as('total_features'),
//         environments: sql`
//             COALESCE(JSON_AGG(JSON_BUILD_OBJECT(
//                 'id', e.id,
//                 'name', e.name,
//                 'total_configurations', (SELECT COUNT (*) FROM configurations c WHERE c.environment = e.id)
//             )) FILTER (WHERE e.id IS NOT NULL), '[]') as environments
//         `.as('environments')
//     }).from(projectMemberships)
//         .leftJoin(projects, r => eq(projects.id, r.id))
//         .leftJoin(environments, r => eq(environments.project, r.id))
//         .leftJoin(features, r => eq(features.project, r.id))
//         .leftJoin(configurations, r => eq(configurations.project, r.id))
// })