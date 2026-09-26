import { randomUUID } from 'crypto';
import { eq, exists } from 'drizzle-orm';
import z from "zod";

const Request = z.object({
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
  onRequest: [requireAuth, requireOrgMembership],
  handler: async event => {
    const { session } = useAuth();
    const body = await readBody(event);
    const { success, error, data } = Request.safeParse(body);
    if (!success)
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad request',
        data: z.treeifyError(error)
      });

    const db = useDatabase({ projects, organizations });
    const { name } = data;
    const { session: { activeOrganizationId: org } } = useAuth();

    try {
      const [{ id }] = await db.transaction(tx => tx.insert(projects).values({
        name,
        createdBy: session.activeMembership,
        organization: org
      }).returning());
      setResponseStatus(event, 201, 'Created');
      runAppTask('event:record', 'projects.create', event, 'Project Created', 'PROJ_CREATE', { id })
      return { id };
    } catch (e) {
      console.error(e);
      throw createError({ cause: e, message: e.message, status: 500, statusMessage: 'Internal Server Error' })
    }
  }
})
