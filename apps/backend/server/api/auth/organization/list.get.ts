import { defineHandler, defineRouteMeta } from "nitro";
import auth, { requireAuth } from "~/server/utils/better-auth";

export default defineHandler({
  middleware: [requireAuth],
  handler: async (event) => {
    const { headers } = event.req;
    const result = await auth.api.listOrganizations({ headers });
    return result;
  },
});

defineRouteMeta({
  openAPI: {
    summary: "List Organizations",
    tags: ["Auth"],
    operationId: "listOrganizations",
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: {
              type: "array",
              items: { $ref: "#/components/schemas/OrganizationBase" },
            },
          },
        },
      },
    },
  },
});
