import { EnvironmentSchema, NewEnvironmentRequestSchema } from "@envo/common";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";

const RouterParamsSchema = z.object({
  project: z.uuid()
});

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg('project')],
  handler: async event => {
    const paramsValidation = await getValidatedRouterParams(event, RouterParamsSchema.safeParse);
    const requestBody = await readBody(event);
    const bodyValidation = NewEnvironmentRequestSchema.safeParse(requestBody);

    if (!paramsValidation.success || !bodyValidation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: z.prettifyError(paramsValidation.error ?? bodyValidation.error)
      });
    }

    const db = useDatabase({ projects, environments });

    return await db.transaction(async tx => {
      const [newEnv] = await tx.insert(environments)
        .values({
          ...bodyValidation.data,
          isDefault: bodyValidation.data.isDefault ?? true,
          project: paramsValidation.data.project
        }).returning();

      await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, paramsValidation.data.project))
      if (newEnv.isDefault) {
        console.log('new environment is marked default. Resetting all other environments in project');
        await tx.update(environments).set({ isDefault: false })
          .where(and(
            ne(environments.id, newEnv.id),
            eq(environments.project, paramsValidation.data.project)
          ));
      }

      runAppTask('event:record', 'projects.environments.create', event, 'New environment created', {
        id: newEnv.id
      });

      setResponseStatus(event, 201);
      return EnvironmentSchema.parse(newEnv);
    })
  }
})