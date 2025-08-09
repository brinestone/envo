import { eq } from "drizzle-orm";
import { ProjectSchema } from 'shared';

export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async () => {
    const db = useDatabase({ organizations, projects })
    const { session: { activeOrganizationId: org } } = useAuth()
    return await db.select().from(projects)
      .where(eq(projects.organization, String(org)))
      .then(v => ProjectSchema.array().parse(v));
  }
});