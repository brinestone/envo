import { AuthContext } from "@helpers/misc";
import { configurations, environments, features, projectMemberships } from "@schemas/projects";
import { and, count, eq, ne, not } from "drizzle-orm";
import { Static, t } from "elysia";

export const environmentLookupSchema = t.Object({
    id: t.String({ format: 'uuid' }),
    project: t.String({ format: 'uuid' }),
    name: t.String(),
    totalConfigurations: t.Number(),
    totalFeatures: t.Number(),
    enabled: t.Boolean(),
    lastUpdated: t.Union([t.String(), t.Date()])
});

export const newEnvironmentSchema = t.Object({
    name: t.String({ pattern: '^[a-zA-Z0-9]+$' })
});

export async function handleToggleEnvironmentStatus({ user, params, set, db }: AuthContext) {
    const { project, env } = params;
    const projectAccessible = (await db.select({ count: count(projectMemberships.id) }).from(projectMemberships).where(and(eq(projectMemberships.user, user.id), ne(projectMemberships.revoked, true), eq(projectMemberships.project, project))))[0]?.count > 0;
    if (!projectAccessible) {
        set.status = 'Forbidden';
        return { message: 'Access denied' };
    }

    await db.transaction(t => t.update(environments).set({
        enabled: not(environments.enabled)
    }).where(eq(environments.id, env)));

    set.status = 'Accepted';

    const [result] = await db.select({
        id: environments.id,
        project: environments.project,
        name: environments.name,
        totalConfigurations: count(configurations.name),
        totalFeatures: count(features.id),
        enabled: environments.enabled,
        lastUpdated: environments.updatedAt
    }).from(environments)
        .innerJoin(projectMemberships, (r) => eq(projectMemberships.project, r.project))
        .leftJoin(configurations, (r) => eq(configurations.project, r.project))
        .leftJoin(features, (r) => eq(features.project, r.project))
        .where(eq(projectMemberships.project, project))
        .groupBy(environments.id);

    return result ?? null;
}

export async function handleCreateProjectEnvironment({ user, params, db, body, set }: AuthContext<Static<typeof newEnvironmentSchema>>) {
    const projectId = params.project;
    const projectAccessible = (await db.select({ count: count(projectMemberships.id) }).from(projectMemberships).where(and(eq(projectMemberships.user, user.id), ne(projectMemberships.revoked, true), eq(projectMemberships.project, projectId))))[0]?.count > 0;
    if (!projectAccessible) {
        set.status = 'Forbidden';
        return { message: 'Access denied' };
    }
    const [result] = await db.transaction(t => t.insert(environments).values({
        name: body.name,
        project: projectId
    }).returning({ id: environments.id }));

    set.status = 'Created';

    return result;
}

export async function handleFindProjectEnvironments({ user, params, db }: AuthContext) {
    const id = params.project;
    const result = await db.select({
        id: environments.id,
        project: environments.project,
        name: environments.name,
        totalConfigurations: count(configurations.name),
        totalFeatures: count(features.id),
        enabled: environments.enabled,
        lastUpdated: environments.updatedAt
    }).from(environments)
        .innerJoin(projectMemberships, (r) => eq(projectMemberships.project, r.project))
        .leftJoin(configurations, (r) => eq(configurations.project, r.project))
        .leftJoin(features, (r) => eq(features.project, r.project))
        .where(and(eq(projectMemberships.project, id), eq(projectMemberships.user, user.id)))
        .groupBy(environments.id);

    return result;
}