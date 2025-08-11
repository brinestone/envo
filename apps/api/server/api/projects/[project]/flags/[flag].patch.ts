import { UpdateFeatureFlagRequestSchema } from "@envo/dto";
import { and, count, eq } from "drizzle-orm";
import z from "zod";
const ParamsSchema = z.object({
  flag: z.uuid(),
  project: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const validationResult = await getValidatedRouterParams(event, ParamsSchema.safeParse);
    const db = useDatabase({ features, projects });
    const body = await readBody(event);
    const { success, data, error } = UpdateFeatureFlagRequestSchema.safeParse(body);
    if (!success || !validationResult.success) throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: z.prettifyError(validationResult.error ?? error)
    });

    const { data: { flag: flagId, project } } = validationResult;
    const [{ total }] = await db.select({ total: count(features.id) }).from(features)
      .where(and(eq(features.id, flagId), eq(features.project, project)))
    if (total != 1) throw createError({
      statusCode: 404,
      message: 'Feature not found'
    });

    await db.transaction(async tx => {
      const [flag] = await tx.update(features).set(data).returning();
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, project));
      runTask('event:record', {
        payload: {
          name: 'projects.flags.update',
          data: {
            signature: flag.signature,
            id: flag.id,
            project,
            timestamp: new Date()
          }
        }
      });
    });
  }
})