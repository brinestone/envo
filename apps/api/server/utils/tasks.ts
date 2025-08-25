import { H3Event } from 'h3';
import { AppEventContext, AppEventPayload, EventSignature, TaskNames } from "~/types";

export function runAppTask(
  name: TaskNames,
  signature: EventSignature,
  event: H3Event,
  note: string,
  payload?: AppEventPayload
) {
  const { session } = useAuth();
  const context: AppEventContext = {
    actor: session.activeMembership as string,
    name: signature,
    note,
    organization: session.activeOrganizationId as string,
    timestamp: new Date(),
    project: getRouterParam(event, 'project'),
    session: session.id
  };
  runTask(name, {
    context: {
      ...context,
      signature
    },
    payload
  });
}