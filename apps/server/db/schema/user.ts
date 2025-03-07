import { jsonb, pgEnum, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const credentialProviders = pgEnum('credential_providers', ['google', 'local', 'github'])
export const credentialTable = pgTable('credentials', {
    id: text().notNull(),
    params: jsonb().notNull(),
    provider: credentialProviders().notNull(),
    createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
    owner: uuid().references(() => userTable.id, { onDelete: 'cascade' })
}, t => [
    primaryKey({ columns: [t.id, t.provider] })
]);

export const userTable = pgTable('users', {
    id: uuid().defaultRandom().notNull().primaryKey(),
    names: text().notNull(),
    email: text().notNull().unique(),
    image: text(),
    createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
});