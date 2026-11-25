import { defineHandler } from "nitro";
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
    await auth.api.setActiveOrganization({
      body: { organizationId: query.id },
      headers: event.req.headers,
    });
  },
});
