import { NewVariableRequestSchema } from "@envo/common";
import { and, count, eq } from "drizzle-orm";
import z from "zod";

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const { success, data, error } = await readValidatedBody(event, NewVariableRequestSchema.safeParse);
    if (!success) throw createError({
      status: 400,
      message: z.prettifyError(error),
      statusMessage: 'Bad Request'
    });
    const project = getRouterParam(event, 'project');
    const db = useDatabase({ projects, variables });

    const { session } = useAuth();
    await db.transaction(async tx => {
      const [{ total }] = await tx.select({ total: count() }).from(variables).where(and(
        eq(variables.project, project),
        eq(variables.name, data.name)
      ));
      if (total > 0) throw createError({
        statusMessage: 'Conflict',
        statusCode: 409,
        message: 'A variable with the same name already exists in this project'
      });

      const [variable] = await tx.insert(variables).values({
        ...data,
        project
      }).returning();

      setResponseStatus(event, 201, 'Created');
      runTask('event:record', {
        payload: {
          name: 'projects.vars.create',
          data: {
            actor: session.userId,
            session: session.id,
            project,
            id: variable.id,
            timestamp: new Date()
          }
        }
      });
    })
  }
})