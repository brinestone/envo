import { FeatureFlagSchema } from "@envo/common";
import { desc, eq } from "drizzle-orm";
import z from "zod";

defineRouteMeta({
  openAPI: {
    description: 'Get a project\'s Feature flags',
    summary: 'Get Feature flags',
    tags: ['Feature flags', 'Projects']
  }
})

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const project = getRouterParam(event, 'project');
    const db = useDatabase({ features });

    return await db.select()
      .from(features)
      .where(eq(features.project, project))
      .orderBy(desc(features.updatedAt)) // TODO: Enable caching results
      .then(m => FeatureFlagSchema.array().parse(m))
  }
})