import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";
import { validateBodyZod } from "~/server/utils";
import {
  requireActiveOrg,
  requireAuth,
  useAuth,
  useMembership,
} from "~/server/utils/better-auth";
import { useDatabase } from "~/server/utils/db";
import {
  createProject,
  setActiveProject,
} from "~/server/utils/handlers/project";

const bodySchema = z.object({
  name: z.string().trim(),
  slug: z.string().trim(),
  image: z.string().optional(),
});
export default defineHandler({
  middleware: [requireAuth, requireActiveOrg],
  handler: async (event) => {
    const { name, slug, image } = await validateBodyZod(bodySchema, event);

    const db = useDatabase();
    const { session } = useAuth(event);
    const { id: membershipId, organizationId, userId } = useMembership(event);
    const project = await db.transaction(async (tx) => {
      const project = await createProject(tx, {
        organization: organizationId,
        creator: membershipId,
        name,
        image,
        userId,
        slug,
      });

      await setActiveProject(tx, {
        sessionId: session.id,
        projectId: project.id,
        memberId: membershipId,
        organization: organizationId,
        userId,
      });
      return project;
    });

    event.res.status = 201;
    return project;
  },
});

defineRouteMeta({
  openAPI: {
    operationId: "createOrganizationProject",
    summary: "Create Project",
    description: "Create a project in current organization",
    tags: ["Project"],
    responses: {
      201: {
        description: "Project created successfully",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ProjectLookup" },
          },
        },
      },
    },
    requestBody: {
      content: {
        "application/json": {
          schema: {
            required: ["name", "slug"],
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string", nullable: false },
              slug: { type: "string", nullable: false },
              image: { type: "string", nullable: true },
            },
          },
        },
      },
    },
  },
});
