import type { APIError } from "better-auth";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import z from "zod";
import { validateBodyZod } from "~/server/utils";
import auth, { requireAuth, useAuth } from "~/server/utils/better-auth";

const bodySchema = z.object({
  name: z.string().trim(),
  slug: z.string().trim(),
  logo: z.string().trim().nullish().default(null),
  metadata: z.record(z.string(), z.unknown()).optional().default({}),
  keepCurrentActiveOrganization: z.boolean().optional(),
});
export default defineHandler({
  middleware: [requireAuth],
  handler: async (event) => {
    const body = await validateBodyZod(bodySchema, event);
    const { user } = useAuth(event);
    try {
      await auth.api.createOrganization({
        body: {
          ...body,
          userId: user.id,
        },
        headers: event.req.headers,
      });
      event.res.status = 201;
    } catch (e) {
      const err = e as APIError;
      throw HTTPError.status(err.statusCode, err.status as string, {
        message: err.body?.message,
      });
    }
  },
});

defineRouteMeta({
  openAPI: {
    tags: ["Auth"],
    summary: "Create Organization",
    operationId: "createOrganization",
    $global: {
      components: {
        schemas: {
          OrganizationMember: {
            type: "object",
            additionalProperties: false,
            required: ["id", "organizationId", "userId", "role", "createdAt"],
            properties: {
              id: { type: "string" },
              organizationId: { type: "string" },
              userId: { type: "string" },
              role: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
          },
          OrganizationWithMembers: {
            allOf: [
              { $ref: "#/components/schemas/OrganizationBase" },
              {
                type: "object",
                additionalProperties: false,
                required: ["members"],
                properties: {
                  members: {
                    default: [],
                    type: "array",
                    items: { $ref: "#/components/schemas/OrganizationMember" },
                  },
                },
              },
            ],
          },
          OrganizationBase: {
            type: "object",
            additionalProperties: false,
            required: ["id", "name", "slug", "logo", "createdAt"],
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              slug: { type: "string" },
              logo: { type: "string", nullable: true },
              createdAt: { format: "date-time", type: "string" },
              metadata: {
                type: "string",
                contentMediaType: "application/json",
                contentSchema: {
                  type: "object",
                  additionalProperties: true,
                },
              },
            },
          },
        },
      },
    },
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: { type: "string" },
              slug: { type: "string" },
              logo: { type: "string", nullable: true, default: null },
              metadata: {
                type: "object",
                additionalProperties: true,
                default: {},
              },
              keepCurrentActiveOrganization: { type: "boolean" },
            },
            required: ["name", "slug", "logo"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "The organization was created successfully",
      },
    },
  },
});
