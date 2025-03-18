import { AuthContext } from "@helpers/misc";
import { configurations, environments, features, projectMemberships, projects } from "@schemas/projects";
import { and, count, eq, ne, sql } from "drizzle-orm";
import { Static, t } from "elysia";
import { environmentLookupSchema } from "./environments";

export const newProjectSchema = t.Object({
    name: t.String({ pattern: '^[a-zA-Z0-9]+$' })
});

export async function isProjectAccessible({ user, params, db, set }: AuthContext) {
    const { project, env } = params;
    const projectAccessible = (await db.select({ count: count(projectMemberships.id) }).from(projectMemberships).where(and(eq(projectMemberships.user, user.id), ne(projectMemberships.revoked, true), eq(projectMemberships.project, project))))[0]?.count > 0;
    if (!projectAccessible) {
        set.status = 'Forbidden';
        return { message: 'Access denied' };
    }
}

export const detailedProjectSchema = t.Object({
    environments: t.Array(t.Omit(environmentLookupSchema, ['project'])),
    totalConfigurations: t.Number(),
    totalFeatures: t.Number(),
    name: t.String()
    // totalIntegrations: t.Number()
});

export const projectLookupSchema = t.Object({
    membership: t.String({ format: 'uuid' }),
    id: t.Nullable(t.String({ format: 'uuid' })),
    role: t.Nullable(t.Union([t.Literal("owner"), t.Literal("admin"), t.Literal("member")])),
    name: t.Nullable(t.String()),
    createdAt: t.Nullable(t.Date()),
    updatedAt: t.Nullable(t.Date())
});

export async function handleFindProjectById({ user, params, db, set }: AuthContext<Static<typeof detailedProjectSchema>>) {
    const id = params.project;
    const [result] = await db.select({
        id: projectMemberships.project,
        name: projects.name,
        totalConfigurations: count(configurations),
        totalFeatures: count(features),
        environments: sql<Static<typeof environmentLookupSchema>[]>`
            COALESCE(
                json_agg(
                    json_build_object(
                        'id', ${environments.id}, 
                        'name', ${environments.name}, 
                        'project', ${environments.project},
                        'enabled', ${environments.enabled},
                        'lastUpdated', ${environments.updatedAt},
                        'totalFeatures', (SELECT COUNT(*) FROM ${features} WHERE ${features.environment} = ${environments.id}),
                        'totalConfigurations', (SELECT COUNT(*) FROM ${configurations} WHERE ${configurations.environment} = ${environments.id})
                )) FILTER (WHERE ${environments.id} IS NOT NULL), 
                '[]'
            )
        `.as('environments')
    }).from(projectMemberships)
        .innerJoin(projects, r => eq(projects.id, r.id))
        .leftJoin(environments, r => eq(environments.project, r.id))
        .leftJoin(features, r => eq(features.project, r.id))
        .leftJoin(configurations, r => eq(configurations.project, r.id))
        .where(and(eq(projectMemberships.project, id), eq(projectMemberships.user, user.id)))
        .groupBy(projects.id, projectMemberships.project);

    if (!result) {
        set.status = 'Not Found';
        return null;
    }

    return result;
}

export async function handleCreateNewProject({ db, body, user, set }: AuthContext<Static<typeof newProjectSchema>>) {
    const result = await db.transaction(async t => {
        const [{ projectId }] = await t.insert(projects).values({
            name: body.name
        }).returning({ projectId: projects.id });

        await t.insert(projectMemberships).values({
            project: projectId,
            user: user.id,
            role: 'owner'
        });
        return projectId;
    });

    set.status = 'Created';
    return { id: result };
}

export async function handleGetProjects({ user, db }: AuthContext) {
    const result = await db.select({
        membership: projectMemberships.id,
        id: projectMemberships.project,
        role: projectMemberships.role,
        name: projects.name,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt
    }).from(projectMemberships)
        .innerJoin(projects, (r) => eq(projects.id, r.id))
        .where(eq(projectMemberships.user, user.id));

    return result;
}