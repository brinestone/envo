import { UpdateVariableRequestSchema, VariableSchema } from "@envo/common";
import { and, eq } from "drizzle-orm";
import z from "zod"
import { runAppTask } from "~/utils/tasks";
import { maskString } from "~/utils/utils";

const ParamsSchema = z.object({
  project: z.uuid(),
  var: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const paramsValidationResult = await getValidatedRouterParams(event, ParamsSchema.safeParse);
    const bodyValidationResult = await readBody(event).then(v => UpdateVariableRequestSchema.safeParse(v));

    if (!paramsValidationResult.success || !bodyValidationResult.success) {
      const params = { statusCode: 400, statusMessage: 'Bad Request', message: z.prettifyError((paramsValidationResult.error ?? bodyValidationResult.error) as any) };
      throw createError(params);
    }

    const db = useDatabase({ projects, variables });
    const { session } = useAuth();
    return await db.transaction(async tx => {
      const [updatedValue] = await tx.update(variables)
        .set(bodyValidationResult.data)
        .where(and(
          eq(variables.id, paramsValidationResult.data.var),
          eq(variables.project, paramsValidationResult.data.project)
        ))
        .returning();

      await tx.update(projects)
        .set({ updatedAt: new Date() })
        .where(eq(projects.id, paramsValidationResult.data.project));

      setResponseStatus(event, sanitizeStatusCode(202));
      runAppTask('event:record', 'projects.vars.update', event, 'Variable updated', {
        paths: Object.keys(bodyValidationResult.data),
        project: paramsValidationResult.data.project,
        id: paramsValidationResult.data.var,
      });
      return VariableSchema.parse({ ...updatedValue, fallbackMask: maskString(updatedValue.fallbackValue) });
    })
  }
})