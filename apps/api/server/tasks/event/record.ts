import { AppEvent } from "~/types";

export default defineTask({
  meta: {
    name: 'events:write',
    description: 'Register an event that has occurred'
  },
  run: async ({ context, name, payload }: AppEvent) => {
    const logger = useLogger();
    logger.info("Running task: " + name);
    const db = useDatabase({ organizations, member, events });
    try {
      await db.insert(events)
        .values({
          note: context.note,
          actor: context.actor,
          organization: context.organization,
          meta: payload,
          project: context.project,
          recordedAt: context.timestamp
        });
    } catch (e) {
      logger.error('failed to run task: ' + name, { error: e });
      throw e;
    }
    return { result: 'success' };
  }
})