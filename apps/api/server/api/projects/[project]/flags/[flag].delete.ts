import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { runAppTask } from "~/utils/tasks";
const ParamsSchema = z.object({
  flag: z.uuid(),
  project: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const db = useDatabase({ projects, features });
    const { success, error, data } = await getValidatedRouterParams(event, ParamsSchema.safeParse);
    if (!success) throw createError({
      statusCode: 400,
      message: z.prettifyError(error)
    });

    const { project, flag } = data;
    const { session } = useAuth();
    await db.transaction(async tx => {
      const [{ total }] = await db.select({ total: count(features.id) }).from(features)
        .where(and(eq(features.id, flag), eq(features.project, project)))
      if (total != 1) throw createError({
        statusCode: 404,
        message: 'Feature not found'
      });

      const [feature] = await tx.delete(features)
        .where(and(eq(features.id, flag), eq(features.project, project)))
        .returning();
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, project));
      setResponseStatus(event, 202, 'Accepted');
      runAppTask('event:record', 'projects.flags.delete', {
        actor: session.activeMembership as string,
        organization: session.activeOrganizationId as string,
        session: session.id,
        note: 'Feature flag deleted',
        project,
        timestamp: new Date()
      }, {
        id: feature.id
      });
    })
  }
});