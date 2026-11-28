import { eq, sql } from "drizzle-orm";
import { defineMiddleware, HTTPError } from "nitro";
import { getValidatedQuery } from "nitro/h3";
import z from "zod";
import { useDatabase } from "../db";
import { organization } from "../db/organization";
import { projects } from "../db/schema";

const query = z.object({
  project: z.ulid(),
});
export const requireProjectInCurrentOrg = defineMiddleware(async (event) => {
  const { success, data } = await getValidatedQuery(event, query.safeParse);

  if (!success) {
    throw HTTPError.status(403, "Forbidden", {
      message: `Invalid project ID in "project" query parameter`,
    });
  }
  const db = useDatabase();
  const result = await db.execute<{ exists: boolean }>(
    sql`select exists(select 1 from ${organization} inner join ${projects} on ${eq(projects.organization, organization.id)} where ${eq(projects.id, data.project)})`,
  );

  if (!result.rows[0].exists) {
    throw HTTPError.status(403, "Forbidden", {
      message: `Specified project does not exist in current organization`,
    });
  }

  event.context.currentPoject = data.project;
});
