import { isNotNull } from "drizzle-orm";
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "./organization";
import { projects } from "./schema";
import { user } from "./user";

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    activeOrganizationId: text("active_organization"),
    userAgent: text("user_agent"),
    activeProjectId: text("active_project"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("session_userId_idx").on(table.userId),
    index()
      .on(table.activeOrganizationId)
      .where(isNotNull(table.activeOrganizationId)),
    index().on(table.activeProjectId).where(isNotNull(table.activeProjectId)),
    foreignKey({
      columns: [table.activeProjectId],
      foreignColumns: [projects.id],
    }).onDelete("set null"),
    foreignKey({
      columns: [table.activeOrganizationId],
      foreignColumns: [organization.id],
    }).onDelete("set null"),
  ],
);
