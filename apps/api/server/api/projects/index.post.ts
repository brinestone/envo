import { randomUUID } from 'crypto';
import { eq, exists } from 'drizzle-orm';
import z from "zod";

const RequestSchema = z.object({
  name: z.string().meta({
    description: 'The name of the project',
    example: 'Foo',
  })
});

defineRouteMeta({
  openAPI: {
    tags: ['Projects'],
    description: 'Creates a project in current organization',
    summary: 'Create a project',
    responses: {
      '201': {
        description: 'The project was created successfully',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: randomUUID()
                }
              }
            }
          }
        }
      }
    },
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                example: 'Foo',
                description: 'The Project\'s name'
              },
              org: {
                type: 'string',
                description: 'The ID of the organization'
              }
            }
          }
        }
      }
    },
  }
})
export default defineEventHandler({
  onRequest: [requireAuth],
  handler: async event => {
    const { session } = useAuth();
    const body = await readBody(event);
    const { success, error, data } = RequestSchema.safeParse(body);
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

    try {
      const [{ id }] = await db.transaction(tx => tx.insert(projects).values({
        name,
        createdBy: session.userId,
        organization: org
      }).returning());
      setResponseStatus(event, 201, 'Created')
      return { id };
    } catch (e) {
      console.error(e);
      throw createError({ cause: e, message: e.message, status: 500, statusMessage: 'Internal Server Error' })
    }
  }
})