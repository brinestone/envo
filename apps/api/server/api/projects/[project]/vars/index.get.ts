import { VariableSchema } from "@envo/common";
import { desc, eq } from "drizzle-orm";

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const project = getRouterParam(event, 'project');
    const db = useDatabase({ variables });

    return await db.select().from(variables)
      .where(eq(variables.project, project))
      .orderBy(desc(variables.updatedAt))
      .then(v => VariableSchema.array().parse(v));
  }
})