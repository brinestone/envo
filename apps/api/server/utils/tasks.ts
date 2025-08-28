import { H3Event } from 'h3';
import { AppEventContext, AppEventPayload, EventSignature, TaskNames } from "~/types";

export function runAppTask(
  name: TaskNames,
  signature: EventSignature,
  event?: H3Event,
  note?: string,
  payload?: AppEventPayload
) {
  const sessionInfo = useAuth();
  const session = sessionInfo?.session;
  const context: AppEventContext = {
    actor: session?.activeMembership,
    name: signature,
    note,
    organization: session?.activeOrganizationId ?? payload?.organization as string | undefined,
    timestamp: new Date(),
    project: event ? getRouterParam(event, 'project') : undefined,
    session: session?.id
  };
  runTask(name, {
    context: {
      ...context,
      signature
    },
    payload
  });
}