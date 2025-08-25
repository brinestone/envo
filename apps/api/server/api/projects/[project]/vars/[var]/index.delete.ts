import { and, eq } from "drizzle-orm";
import z from "zod";

const ParamsSchema = z.object({
  project: z.uuid(),
  var: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const { success, error, data } = await getValidatedRouterParams(event, ParamsSchema.safeParse);
    if (!success) throw createError({ message: z.prettifyError(error), statusCode: 400 });

    const db = useDatabase({ projects, variables });
    const { session } = useAuth();
    await db.transaction(async tx => {
      await tx.delete(variables).where(and(eq(variables.project, data.project), eq(variables.id, data.var))).returning();
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, data.project));
      setResponseStatus(event, 202);
      runTask('event:record', {
        payload: {
          name: 'projects.vars.delete',
          data: {
            actor: session.userId,
            session: session.id,
            project: data.project,
            id: data.var,
            timestamp: new Date()
          }
        }
      });
    })
  }
})