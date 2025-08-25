import { eq } from "drizzle-orm";
import { AppEvent } from "~/types";

export default defineTask({
  meta: {
    name: 'events:write',
    description: 'Register an event that has occurred'
  },
  run: async (event: AppEvent) => {
    const db = useDatabase({ organizations, member, events });
    try {
      await db.insert(events)
        .values({
          note: event.context.note,
          actor: event.context.actor,
          organization: event.context.organization,
          meta: event.payload,
          project: event.context.project,
          recordedAt: event.context.timestamp
        });
    } catch (e) {
      console.error(e);
      throw e;
    }
    return { result: 'success' };
  }
})