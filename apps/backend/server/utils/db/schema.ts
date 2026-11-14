import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

const mixins = {
  timestamps: {
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
};
export const events = pgTable("events", {
  id: text().notNull().primaryKey(),

  ...mixins.timestamps,
});
