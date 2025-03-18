import { AuthContext } from "@helpers/misc";
import { configurations, configurationValues, environments, environmentVersions, features, featureValues, projectMemberships, projects } from "@schemas/projects";
import { and, count, desc, eq, ne, not, sql } from "drizzle-orm";
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

export const environmentVersionSchema = t.Object({
    createdAt: t.Union([t.String(), t.Date()]),
    label: t.Nullable(t.Optional(t.String())),
    isActive: t.Boolean()
})

export const detailedEnvironmentSchema = t.Composite([
    t.Omit(environmentLookupSchema, ['totalConfigurations', 'totalFeatures']),
    t.Object({
        configurations: t.Array(t.Object({
            name: t.String(),
            value: t.Optional(t.Nullable(t.String())),
            version: t.String(),
            secure: t.Boolean()
        })),
        features: t.Array(t.Object({
            id: t.String({ format: 'uuid' }),
            name: t.String(),
            enabled: t.Boolean(),
            description: t.Optional(t.Nullable(t.String()))
        }))
    })
]);

export const newEnvironmentSchema = t.Object({
    name: t.String({ pattern: '^[a-zA-Z0-9]+$' })
});

export const newEnvironmentVersionSchema = t.Object({
    label: t.Optional(t.String()),
    makeActive: t.Boolean()
});

export const activateEnvironmentVersionSchema = t.Object({
    name: t.String()
});

export async function handleActivateEnvironmentVersion({ params, db, body, set }: AuthContext<Static<typeof activateEnvironmentVersionSchema>>) {
    const { project, env } = params;

    const [{ versionCount }] = await db.select({ versionCount: count() })
        .from(environmentVersions)
        .where(and(
            eq(environmentVersions.project, project),
            eq(environmentVersions.environment, env),
            eq(environmentVersions.name, body.name)
        ));

    if (versionCount <= 0) {
        set.status = 'Not Found';
        return { message: 'Environment version not found' };
    }

    await db.transaction(async t => {
        await t.update(environmentVersions)
            .set({ isActive: false })
            .where(
                and(
                    eq(environmentVersions.project, project),
                    eq(environmentVersions.environment, env)
                )
            );

        await t.update(environmentVersions)
            .set({ isActive: true })
            .where(
                and(
                    eq(environmentVersions.project, project),
                    eq(environmentVersions.environment, env),
                    eq(environmentVersions.name, body.name)
                )
            );
    });

    const result = await db.select({
        createdAt: environmentVersions.createdAt,
        label: environmentVersions.name,
        isActive: environmentVersions.isActive
    }).from(environmentVersions)
        .where(and(eq(environmentVersions.project, project), eq(environmentVersions.environment, env)));

    set.status = 'Accepted';
    return result;
}

export async function handleCreateEnvironmentVersion({ params, db, body, set }: AuthContext<Static<typeof newEnvironmentVersionSchema>>) {
    const { project, env } = params;

    if (body.label) {
        const [{ c }] = await db.select({ c: count() }).
            from(environmentVersions)
            .where(
                and(
                    eq(environmentVersions.environment, env),
                    eq(environmentVersions.project, project),
                    eq(environmentVersions.name, body.label)
                )
            );

        if (c > 0) {
            set.status = 'Conflict';
            return { message: 'A version with this name already exists' };
        }
    }

    const [{ name }] = await db.transaction(async t => {
        if (body.makeActive) {
            await t.update(environmentVersions).set({
                isActive: false
            }).where(and(eq(environmentVersions.environment, env), eq(environmentVersions.project, project)));
        }
        return t.insert(environmentVersions).values({
            name: body.label ?? new Date().toISOString(),
            environment: env,
            project,
            isActive: body.makeActive
        }).returning({ name: environmentVersions.name })
    });

    const [result] = await db.select({
        createdAt: environmentVersions.createdAt,
        label: environmentVersions.name,
        isActive: environmentVersions.isActive
    }).from(environmentVersions)
        .where(and(eq(environmentVersions.name, name), eq(environmentVersions.environment, env)));

    set.status = 'Created';
    return result;
}

export async function handleFindEnvironmentVersions({ params, db, }: AuthContext) {
    const { project, env } = params;

    return await db.select({
        createdAt: environmentVersions.createdAt,
        label: environmentVersions.name,
        isActive: environmentVersions.isActive
    }).from(environmentVersions)
        .where(and(eq(environmentVersions.project, project), eq(environmentVersions.environment, env)))
        .orderBy(desc(environmentVersions.createdAt));
}

export async function handleFindEnvironmentById({ params, set, db }: AuthContext) {
    const { project, env } = params;

    const [result] = await db.select({
        id: environments.id,
        project: environments.project,
        name: environments.name,
        enabled: environments.enabled,
        lastUpdated: environments.updatedAt,
        configurations: sql`
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'name', ${configurations.name},
                        'value', ${configurationValues.value},
                        'version', ${environmentVersions.name},
                        'secure', ${configurations.secured}
                    )
                ) FILTER (WHERE ${configurations.name} IS NOT NULL AND ${configurations.environment} IS NOT NULL),
                '[]'
            )
        `.as('configurations'),
        features: sql`
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', ${features.id},
                        'name', ${features.name},
                        'enabled', ${featureValues.enabled},
                        'description', ${features.description},
                        'version', ${environmentVersions.name}
                    )
                ) FILTER (WHERE ${features.id} IS NOT NULL),
                '[]'
            )
        `.as('features'),
        // versions: sql`
        //     COALESCE(
        //         JSON_AGG(
        //             JSON_BUILD_OBJECT(
        //                 'createdAt', ${environmentVersions.createdAt},
        //                 'name', ${environmentVersions.name},
        //                 'isActive' ${environmentVersions.isActive}
        //             )
        //         ) FILTER (WHERE ${environmentVersions.name} IS NOT NULL AND ${environmentVersions.environment} IS NOT NULL),
        //         '[]'
        //     )
        // `.as('versions')
    }).from(environments)
        .innerJoin(projects, r => eq(projects.id, r.project))
        .leftJoin(configurationValues, r => eq(configurationValues.environment, r.id))
        .leftJoin(featureValues, r => eq(featureValues.environment, r.id))
        .leftJoin(configurations, r => eq(configurations.environment, r.id))
        .leftJoin(features, r => eq(features.environment, r.id))
        .leftJoin(environmentVersions, r => eq(environmentVersions.environment, r.id))
        .where(and(eq(environments.id, env), eq(environments.project, project)))
        .groupBy(environments.id);

    if (!result) {
        set.status = 'Not Found';
        return;
    }

    return result;
}

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
    const result = await db.transaction(async t => {
        const [result] = await t.insert(environments).values({
            name: body.name,
            project: projectId
        }).returning({ id: environments.id });

        await t.insert(environmentVersions).values({
            name: 'default',
            environment: result.id,
            project: projectId,
            isActive: true
        });

        return result;
    });

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