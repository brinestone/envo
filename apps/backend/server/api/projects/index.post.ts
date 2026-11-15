import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";
import { validateBodyZod } from "~/server/utils";
import { requireActiveOrg, requireAuth, useMembership } from "~/server/utils/auth";
import { useDatabase } from "~/server/utils/db";
import { createProject } from "~/server/utils/handlers/project";

const bodySchema = z.object({
  name: z.string().trim(),
});
export default defineHandler({
  middleware: [requireAuth, requireActiveOrg],
  handler: async (event) => {
    const { name } = await validateBodyZod(bodySchema, event);

    const db = useDatabase();
    const { id: membershipId, organizationId, userId } = useMembership(event);
    const project = await db.transaction((tx) =>
      createProject(tx, {
        organization: organizationId,
        creator: membershipId,
        name,
        userId,
      }),
    );
    event.res.status = 201;
    return project;
  },
});

defineRouteMeta({
  openAPI: {
    summary: "Create Project",
    description: "Create a project in current organization",
    tags: ["Project"],
    operationId: "createOrganizationProject",
    requestBody: {
      content: {
        "application/json": {
          schema: {
            required: ["name"],
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string", nullable: false },
            },
          },
        },
      },
    },
  },
});
