import type { APIError } from "better-auth";
import { defineHandler, defineRouteMeta, HTTPError } from "nitro";
import z from "zod";
import { validateQueryZod } from "~/server/utils";
import auth, { requireAuth } from "~/server/utils/auth";

const querySchema = z.object({
  id: z.string(),
});
export default defineHandler({
  middleware: [requireAuth],
  handler: async (event) => {
    const query = await validateQueryZod(querySchema, event);
    try {
      await auth.api.setActiveOrganization({
        body: { organizationId: query.id },
        headers: event.req.headers,
      });
      event.res.status = 202;
    } catch (e) {
      const err = e as APIError;
      throw HTTPError.status(err.statusCode, undefined, {
        message: err.body?.message,
      });
    }
  },
});

defineRouteMeta({
  openAPI: {
    operationId: "setActiveOrganization",
    summary: "Set Active",
    tags: ["Auth"],
    description: "Set active organization",
    parameters: [
      { name: "id", in: "query", schema: { type: "string" }, required: true },
    ],
    responses: {
      201: { description: "Activation successful" },
    },
  },
});
