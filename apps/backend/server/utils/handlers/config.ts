import { sql } from "drizzle-orm";
import { ulid } from "ulid";
import { configs, events, outbox } from "../db/schema";
import { excluded, type ConnectionLike } from "../utils";

export type UpsertConfigInput = {
  key: string;
  label?: string;
  value?: string;
  project: string;
  organization: string;
  membershipId: string;
  userId: string;
};
export async function upsertConfig(tx: ConnectionLike, payload: UpsertConfigInput) {
  const traceId = ulid();
  const eventId = ulid();
  const [targetConfig] = await tx
    .insert(configs)
    .values({
      key: payload.key,
      project: payload.project,
      traceId,
      label: payload.label,
      value: payload.value,
    })
    .onConflictDoUpdate({
      target: [configs.project, configs.key, configs.version],
      set: {
        version: sql`${configs.version} + 1`,
        value: excluded(configs.value),
        label: excluded(configs.label),
        traceId: excluded(configs.traceId),
      },
    })
    .returning();
  await tx.insert(events).values({
    id: eventId,
    note: "config upserted",
    target: [payload.project, payload.key].join(","),
    targetType: "config",
    traceId,
    organization: payload.organization,
    triggeredBy: payload.membershipId,
    userId: payload.userId,
  });
  await tx.insert(outbox).values({
    id: ulid(),
    eventKey: `organizations.${payload.organization}.projects.${payload.project}.configs.${payload.key}.upsert`,
    payload: { key: payload.key, project: payload.project, version: targetConfig.version },
    traceId,
  });
}
