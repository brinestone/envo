import { FeatureFlagSchema, NewFeatureRequestSchema } from "@envo/common";
import { z } from "zod";
import { requireOrgMembership, requireProjectUnderOrg } from "~/utils/auth";

export default defineEventHandler({
  onRequest: [requireAuth, requireOrgMembership, requireProjectUnderOrg],
  handler: async event => {
    const { success, data, error } = await readValidatedBody(event, NewFeatureRequestSchema.safeParse)
    if (!success) throw createError({
      message: z.prettifyError(error),
      statusMessage: 'Bad Request',
      status: 400
    });

    const project = getRouterParam(event, 'project');
    const db = useDatabase({ projects, features });
    console.log('creating new feature flag under project: ' + project);
    return await db.transaction(async tx => {
      const [feature] = await tx.insert(features).values({
        enabled: data.enabled,
        signature: data.signature,
        displayName: data.displayName,
        description: data.description,
        project
      }).returning();

      console.log('feature flag created: ' + feature.id);
      // if (data.overrides.length > 0) {
      //   console.log('applying zone overrides to feature: ' + feature.id);
      //   await Promise.all(data.overrides.map(override => tx.insert(featureZoneOverrides).values({
      //     enabled: typeof override.enabled == 'boolean' ? override.enabled : null,
      //     scheduledEnable: typeof override.enabled != 'boolean' ? new Date(override.enabled) : null,
      //     feature: feature.id
      //   })));
      // }

      setResponseStatus(event, 201, 'Created');
      const { session } = useAuth();
      runTask('event:record', {
        payload: {
          name: 'projects.flags.create',
          data: {
            actor: session.userId,
            session: session.id,
            signature: feature.signature,
            project,
            id: feature.id,
            timestamp: new Date()
          }
        }
      });
    });
  }
})