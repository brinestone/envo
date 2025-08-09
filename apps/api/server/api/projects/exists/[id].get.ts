import { count, eq } from "drizzle-orm";

export default defineCachedEventHandler(async event => {
  const id = getRouterParam(event, 'id');
  const db = useDatabase({ projects });
  const [{ total }] = await db.select({ total: count() }).from(projects).where(eq(projects.id, id))
  return { exists: total > 0 }
})