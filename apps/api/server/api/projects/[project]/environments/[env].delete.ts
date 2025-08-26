import { and, eq, sql } from "drizzle-orm";
import z from "zod";

const ParamsSchema = z.object({
  project: z.uuid(),
  env: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const { success, error, data } = await getValidatedRouterParams(event, ParamsSchema.safeParse);
    if (!success) {
      throw createError({
        statusCode: 400,
        message: z.prettifyError(error)
      })
    }

    const db = useDatabase({ environments, projects });
    await db.transaction(async tx => {
      const [deletedEnv] = await tx.delete(environments)
        .where(and(
          eq(environments.id, data.env),
          eq(environments.project, data.project)
        )).returning();

      if (!deletedEnv) {
        throw createError({ statusCode: 404, message: 'Environment does not exist' })
      }

      if (deletedEnv.isDefault) {
        const [newDefaultEnvironment] = await tx.update(environments)
          .set({ isDefault: true })
          .where(and(
            eq(environments.project, data.project),
            eq(environments.id, sql<string>`(SELECT ${environments.id} FROM ${environments} WHERE ${eq(environments.project, data.project)} ORDER BY ${environments.createdAt} DESC LIMIT 1)`)
          )).returning();
        if (newDefaultEnvironment) {
          runAppTask('event:record', 'projects.environments.update', event, 'Environment made default automatically', {
            id: newDefaultEnvironment.id
          });
        }
      }

      await tx.update(projects)
        .set({ updatedAt: new Date() })
        .where(eq(projects.id, data.project));

      setResponseStatus(event, 202);
      runAppTask('event:record', 'projects.environments.delete', event, 'Environment removed from project', {
        id: deletedEnv.id
      })
    })

  }
})