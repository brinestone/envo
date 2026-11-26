import { defineHandler, defineRouteMeta } from "nitro";
import z from "zod";
import { validateQueryZod } from "~/server/utils";
import auth, { requireActiveOrg, requireAuth } from "~/server/utils/auth";
import { requireProjectInCurrentOrg } from "~/server/utils/middlewares";

const querySchema = z.object({
  project: z.ulid("Invalid project ID. It must be a ULID value"),
});
export default defineHandler({
  middleware: [requireAuth, requireActiveOrg, requireProjectInCurrentOrg],
  handler: async (event) => {
    const query = await validateQueryZod(querySchema, event);
    await auth.api.updateSession({
      headers: event.req.headers,
      body: {
        activeProjectId: query.project,
      },
    });
    event.res.status = 202;
  },
});

defineRouteMeta({
  openAPI: {
    operationId: "setActiveOrganizationProject",
    summary: "Set Active",
    description:
      "Update the current user's session's activeProjectId in the current organization",
    tags: ["Project"],
    $global: {
      components: {
        parameters: {
          ProjectIdParam: {
            name: "project",
            in: "query",
            schema: { type: "string", format: "ulid" },
            required: true,
          },
        },
      },
    },
    parameters: [
      {
        $ref: "#/components/parameters/ProjectIdParam",
      },
    ],
    responses: {
      202: {
        description: "The project was set as active project successfully",
      },
    },
  },
});
