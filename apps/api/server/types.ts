import { Session, User } from "better-auth";
import { TaskContext, TaskEvent, TaskPayload } from "nitropack";

type AppEventGroups = 'projects' | 'users' | 'organizations';
type AppEventTargets = 'flags' | 'vars' | 'events' | 'environments' | 'clients';
type AppActions = 'create' | 'update' | 'delete' | 'sync';
type TaskGroups = 'event';
type TaskActions = 'record';
type PrimitiveTypes = string | number | boolean | Date;

export type AppSession = Session & { activeOrganizationId?: string, activeMembership?: string };
export type AppUser = User & { isServiceAccount: boolean };
export type AppResources = `${AppEventGroups}.${AppEventTargets}`;
export type EventSignature = `${AppEventGroups}.${AppEventTargets}.${AppActions}` | `${AppEventGroups}.${AppActions}`;
export type TaskNames = `${TaskGroups}:${TaskActions}`;
export type AppEventPayload = Record<string, PrimitiveTypes | PrimitiveTypes[]> & TaskPayload;
export type AppEventContext = TaskContext & {
  note: string;
  name: EventSignature;
  actor?: string;
  session?: string;
  timestamp: Date;
  project?: string;
  organization?: string;
};

export type AppEvent = TaskEvent & {
  name: TaskNames;
  context: AppEventContext;
  payload?: AppEventPayload
}