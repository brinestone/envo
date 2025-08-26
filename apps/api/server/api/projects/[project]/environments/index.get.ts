import { EnvironmentSchema } from "@envo/common";
import { desc, eq } from "drizzle-orm";
import z from "zod"

const RouterParamsSchema = z.object({
  project: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const { success, error, data } = await getValidatedRouterParams(event, RouterParamsSchema.safeParse);
    if (!success) throw createError({ statusCode: 400, message: z.prettifyError(error) });

    const db = useDatabase({ environments });
    return await db.select()
      .from(environments)
      .where(eq(environments.project, data.project))
      .orderBy(desc(environments.createdAt))
      .then(v => EnvironmentSchema.array().parse(v));
  }
})