import { defineRouteMeta, defineHandler } from "nitro";
import z from "zod";
import { validateBodyZod, validateRouterZod } from "~/server/utils";
import {
  requireAuth,
  useAuth,
  useMembership,
} from "~/server/utils/better-auth";
import { useDatabase } from "~/server/utils/db";
import { upsertConfig } from "~/server/utils/handlers/config";

const bodySchema = z.object({
  key: z.string().trim(),
  value: z.string().trim(),
  label: z.string().trim().optional(),
});

const pathSchema = z.object({
  project: z.string().trim().pipe(z.ulid()),
});
export default defineHandler({
  middleware: [requireAuth],
  handler: async (event) => {
    const { project } = await validateRouterZod(pathSchema, event);
    const { key, value, label } = await validateBodyZod(bodySchema, event);

    const db = useDatabase();
    const { user } = useAuth(event);
    const { id: membershipId, organizationId } = useMembership(event);
    await db.transaction(async (tx) => {
      await upsertConfig(tx, {
        key,
        value,
        label,
        userId: user.id,
        membershipId,
        organization: organizationId,
        project,
      });
    });

    event.res.status = 201;
  },
});

defineRouteMeta({
  openAPI: {
    summary: "Upsert config",
    operationId: "upsertProjectConfig",
    tags: ["Project", "Config"],
    $global: {
      components: {
        schemas: {
          ErrorPayload: {
            type: "object",
            required: ["error", "status", "message"],
            additionalProperties: false,
            properties: {
              error: { type: "boolean" },
              status: { type: "number" },
              message: { type: "string", nullable: true },
            },
          },
        },
        responses: {
          BadRequestResponse: {
            description: "When a client request is invalid",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorPayload",
                },
              },
            },
          },
        },
      },
    },
    responses: {
      201: { description: "The config was upserted successfully" },
      400: { $ref: "#/components/responses/BadRequestResponse" },
    },
    requestBody: {
      content: {
        "application/json": {
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              key: { type: "string" },
              value: { type: "string" },
              label: { type: "string", nullable: true },
            },
            required: ["key", "value"],
          },
        },
      },
    },
    parameters: [
      {
        name: "project",
        in: "path",
        required: true,
        schema: { type: "string" },
      },
    ],
  },
});
