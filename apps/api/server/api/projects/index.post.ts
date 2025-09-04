import { NewProjectRequestSchema } from '@envo/common';
import { eq, exists } from 'drizzle-orm';
import z from "zod";

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership],
  handler: async event => {
    const { session } = useAuth();
    const body = await readBody(event);
    const { success, error, data } = NewProjectRequestSchema.safeParse(body);
    if (!success)
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad request',
        data: z.treeifyError(error)
      });

    const db = useDatabase({ projects, organizations });
    const { name } = data;
    const org = session.activeOrganizationId ?? session.userId;
    const orgs = await db.select().from(organizations)
      .where(exists(db.select().from(organizations).where(eq(organizations.id, org))));

    if (orgs.length == 0)
      throw createError({
        statusCode: 404,
        message: 'Organization not found'
      });

    return await db.transaction(async tx => {
      const [{ id }] = await tx.insert(projects).values({
        name, createdBy: session.activeMembership, organization: org
      }).returning();

      setResponseStatus(event, 201);
      runAppTask('event:record', 'projects.create', event, 'Project created', { id });

      return { id };
    });
  }
})