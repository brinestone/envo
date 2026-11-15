import { and, count, eq, getColumns, isNotNull, isNull, sql } from "drizzle-orm";
import {
  alias,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  pgView,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { member, organization, user } from "./auth";

const mixins = {
  timestamps: {
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
};

export const projects = pgTable(
  "projects",
  {
    image: text(),
    id: text().notNull().primaryKey(),
    name: text().notNull(),
    organization: text().notNull(),
    createdBy: text("created_by"),
    ...mixins.timestamps,
  },
  (t) => [
    index().on(t.organization),
    index().on(t.createdBy),
    index().on(t.updatedAt),
    index().on(t.createdAt),
    foreignKey({
      columns: [t.createdBy],
      foreignColumns: [member.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [t.organization],
      foreignColumns: [organization.id],
    }).onDelete("cascade"),
  ],
);

export const configs = pgTable(
  "configs",
  {
    project: text().notNull(),
    key: text().notNull(),
    label: text(),
    value: text(),
    ...mixins.timestamps,
    version: integer().notNull().default(1),
    traceId: text("trace_id").notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [
    index().on(t.project),
    index().on(t.key),
    index().on(t.traceId),
    index().on(t.version),
    index().on(t.project, t.key),
    index().on(t.key, t.version),
    index().on(t.createdAt),
    index().on(t.updatedAt),
    index().on(t.deletedAt).where(isNull(t.deletedAt)),
    foreignKey({
      columns: [t.project],
      foreignColumns: [projects.id],
    }).onDelete("cascade"),
    uniqueIndex().on(t.project, t.key, t.version).where(isNotNull(t.deletedAt)),
  ],
);

export const events = pgTable(
  "events",
  {
    id: text().notNull().primaryKey(),
    target: text().notNull(),
    targetType: text("target_type").notNull(),
    organization: text(),
    userId: text("user_id"),
    traceId: text("trace_id").notNull(),
    triggeredBy: text("triggered_by"),
    note: text().notNull(),
    recordedAt: timestamp("recorded_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    index().on(t.target),
    index().on(t.traceId),
    index().on(t.userId).where(isNotNull(t.userId)),
    index().on(t.organization).where(isNotNull(t.organization)),
    index().on(t.triggeredBy).where(isNotNull(t.triggeredBy)),
    foreignKey({
      columns: [t.userId],
      foreignColumns: [user.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [t.organization],
      foreignColumns: [organization.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [t.triggeredBy],
      foreignColumns: [member.id],
    }).onDelete("set null"),
  ],
);

export const outbox = pgTable(
  "outbox",
  {
    id: text().notNull().primaryKey(),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
    eventKey: text("event_key").notNull(),
    payload: jsonb().notNull(),
    traceId: text("trace_id").notNull(),
    processor: text(),
    output: jsonb(),
    ...mixins.timestamps,
  },
  (t) => [
    index().on(t.eventKey),
    index().on(t.traceId),
    index().on(t.processor),
    index().on(t.processedAt).where(isNotNull(t.processedAt)),
  ],
);

export const projectLookups = pgView("vw_project_lookups").as((qb) => {
  const c = alias(configs, "c");
  const p = alias(projects, "p");
  const ucc = qb.$with("unique_config").as((q) => q.selectDistinctOn([c.project, c.key]).from(c));
  const u = alias(user, "u");
  const m = alias(member, "m");

  return qb
    .with(ucc)
    .select({
      id: p.id,
      name: p.name,
      image: p.image,
      organization: p.organization,
      creatorMember: p.createdBy,
      creatorId: m.userId,
      creatorName: u.name.as("creator_name"),
      creatorAvatar: u.image.as("creator_avatar"),
      configCount: count(ucc.key).as("config_count"),
    })
    .from(p)
    .leftJoin(ucc, ({ id }) => and(isNull(ucc.deletedAt), eq(ucc.project, id)))
    .leftJoin(m, ({ creatorMember }) => eq(m.id, creatorMember))
    .leftJoin(u, ({ creatorId }) => eq(u.id, creatorId))
    .groupBy(p.id, m.userId, u.name, u.image);
});
