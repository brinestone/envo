import { eq } from "drizzle-orm";

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const varId = getRouterParam(event, 'var');
    const db = useDatabase({ variables });
    return await db.select({ value: variables.fallbackValue })
      .from(variables)
      .where(eq(variables.id, varId))
      .then(([v]) => v)
  }
});