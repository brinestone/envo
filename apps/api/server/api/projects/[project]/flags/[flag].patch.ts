import { FeatureFlagSchema, UpdateFeatureFlagRequestSchema } from "@envo/common";
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
    const [{ total, signature }] = await db.select({ total: count(features.id), signature: features.signature }).from(features)
      .where(
        and(
          eq(features.id, flagId), eq(features.project, project)
        )
      ).groupBy(features.signature);
    if (total != 1) throw createError({
      statusCode: 404,
      message: 'Feature not found'
    });

    if (data.signature === signature) delete data.signature;
    const { session } = useAuth();
    return await db.transaction(async tx => {
      const [flag] = await tx.update(features).set(data).where(
        eq(features.id, flagId)
      ).returning();
      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, project));

      runAppTask('event:record', 'projects.flags.update', event, 'Feature flag updated', { signature: flag.signature });
      setResponseStatus(event, 202, 'Accepted');
      return FeatureFlagSchema.parse(flag);
    });
  }
})