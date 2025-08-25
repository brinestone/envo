import { TaskContext, TaskEvent, TaskPayload } from "nitropack";

type AppEventGroups = 'projects';
type AppEventTargets = 'flags' | 'vars';
type AppActions = 'create' | 'update' | 'delete' | 'sync';
type TaskGroups = 'event';
type TaskActions = 'record';
type PrimitiveTypes = string | number | boolean | Date;

export type EventSignature = `${AppEventGroups}.${AppEventTargets}.${AppActions}`;
export type TaskNames = `${TaskGroups}:${TaskActions}`;
export type AppEventPayload = Record<string, PrimitiveTypes | PrimitiveTypes[]> & TaskPayload;
export type AppEventContext = TaskContext & {
  note: string;
  name: EventSignature;
  actor: string;
  session?: string;
  timestamp: Date;
  project?: string;
  organization: string;
};

export type AppEvent = TaskEvent & {
  name: TaskNames;
  context: AppEventContext;
  payload?: AppEventPayload
}