import { eq } from "drizzle-orm";


export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async event => {
    const db = useDatabase(event, { organizations, projects })
    const org = getRouterParam(event, 'org');
    return db.select().from(projects)
      .where(eq(projects.organization, org));
  }
})