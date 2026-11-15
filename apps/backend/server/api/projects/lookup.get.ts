import { defineHandler, defineRouteMeta } from "nitro";
import { validateQueryZod } from "~/server/utils";
import { requireActiveOrg, requireAuth, useMembership } from "~/server/utils/auth";
import { useDatabase } from "~/server/utils/db";
import { lookupProjects } from "~/server/utils/handlers/project";
import { PaginationParams } from "~/server/utils/utils";

const querySchema = PaginationParams;
export default defineHandler({
  middleware: [requireAuth, requireActiveOrg],
  handler: async (event) => {
    const { page, size, cursor } = await validateQueryZod(querySchema, event);
    const db = useDatabase();
    const { organizationId } = useMembership(event);
    return await lookupProjects(db, { page, size, cursor, organization: organizationId });
  },
});

defineRouteMeta({
  openAPI: {
    summary: "Lookup projects",
    tags: ["Project"],
    operationId: "lookupOrganizationProjects",
    parameters: [
      {
        name: "page",
        in: "query",
        schema: { type: "number", minimum: 0, default: 0 },
        description: "Pagination page index",
      },
      {
        name: "size",
        in: "query",
        schema: { type: "number", minimum: 1, default: 100 },
        description: "Pagination size",
      },
      {
        name: "cursor",
        in: "query",
        schema: { type: "string" },
        description: "A project ID cursor",
      },
    ],
    $global: {
      components: {
        schemas: {
          ProjectLookup: {
            type: "object",
            additionalProperties: false,
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              image: { type: "string", nullable: true },
              organization: { type: "string" },
              creatorMember: { type: "string", nullable: true },
              creatorId: { type: "string", nullable: true },
              creatorName: { type: "string", nullable: true },
              creatorAvatar: { type: "string", nullable: true },
              configCount: { type: "number", minimum: 0 },
            },
            required: [
              "id",
              "name",
              "image",
              "organization",
              "creatorMember",
              "creatorId",
              "creatorName",
              "creatorAvatar",
              "configCount",
            ],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Operation successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                hasNextPage: { type: "boolean" },
                size: { type: "number" },
                data: { type: "array", items: { $ref: "#/components/schemas/ProjectLookup" } },
                totalRecords: { type: "number" },
                totalPages: { type: "number" },
              },
              required: ["hasNextPage", "size", "data", "totalRecords", "totalPages"],
            },
          },
        },
      },
    },
  },
});
