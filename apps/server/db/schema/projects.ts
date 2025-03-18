import { boolean, foreignKey, pgEnum, pgTable, primaryKey, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const environmentVersions = pgTable('env_versions', {
    name: varchar().notNull(),
    createdAt: timestamp().defaultNow(),
    environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' }),
    project: uuid().notNull().references(() => projects.id),
    isActive: boolean().default(false),
}, t => [
    primaryKey({ columns: [t.name, t.environment] })
]);

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
    description: text()
});

export const configurationValues = pgTable('configuration_values', {
    configName: varchar().notNull(),
    environment: uuid().notNull().references(() => environments.id),
    value: text(),
    versionName: varchar().notNull()
}, t => [
    primaryKey({ columns: [t.configName, t.environment, t.versionName] }),
    foreignKey({
        columns: [t.configName, t.environment],
        foreignColumns: [configurations.name, configurations.environment]
    }).onDelete('cascade'),
    foreignKey({
        columns: [t.versionName, t.environment],
        foreignColumns: [environmentVersions.name, environmentVersions.environment]
    }).onDelete('cascade')
]);

export const featureValues = pgTable('feature_values', {
    feature: uuid().notNull().references(() => features.id, { onDelete: 'cascade' }),
    environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' }),
    enabled: boolean().notNull().default(true)
});