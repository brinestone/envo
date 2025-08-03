import { eq } from "drizzle-orm";
import { ProjectSchema } from 'shared';


export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async event => {
    const db = useDatabase(event, { organizations, projects })
    const org = getRouterParam(event, 'org');
    return await db.select().from(projects)
      .where(eq(projects.organization, org))
      .then(v => ProjectSchema.array().parse(v));
  }
})