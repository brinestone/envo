import { sql } from "drizzle-orm";
import { bigint, bigserial, boolean, integer, interval, jsonb, pgEnum, pgTable, pgView, real, smallint, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable('projects', {
	id: uuid().notNull().defaultRandom().primaryKey(),
	name: text().notNull(),
	enabled: boolean().default(true).notNull(),
	organization: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
	createdBy: text().references(() => member.id, { onDelete: 'set null' })
});

export const events = pgTable('events', {
	id: uuid().notNull().defaultRandom().primaryKey(),
	note: text().notNull(),
	recordedAt: timestamp({ mode: 'date' }).defaultNow(),
	actor: text().references(() => member.id, { onDelete: 'set null' }),
	project: uuid().references(() => projects.id, { onDelete: 'set null' }),
	meta: jsonb()
});

export const agentTypes = pgEnum('agent_types', ['web', 'mobile', 'cli', 'server']);
export const syncTransports = pgEnum('sync_transports', ['sse', 'websocket', 'webhook', 'poll', 'pub-sub']);
export const agents = pgTable('agents', {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	currentIp: text().notNull(),
	ping: smallint().default(0),
	type: agentTypes().notNull(),
	syncTransport: syncTransports().notNull(),
	syncParams: jsonb().notNull(),
	environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' })
});

export const secrets = pgTable("values", {
	id: uuid().notNull().defaultRandom().primaryKey(),
	name: text().notNull(),
	createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
	isSecret: boolean().default(false).notNull(),
	project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' })
});

export const features = pgTable('features', {
	id: uuid().notNull().defaultRandom().primaryKey(),
	name: text().notNull(),
	label: text(),
	project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' })
});

export const environments = pgTable("environments", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	name: text().notNull(),
	createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: "date" })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
	project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' })
});

export const environmentConfigs = pgTable('environment_configs', {
	secret: uuid().notNull().references(() => secrets.id, { onDelete: 'cascade' }),
	environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' }),
	value: text()
});

export const environmentFeatures = pgTable('environment_features', {
	feature: uuid().notNull().references(() => features.id, { onDelete: 'cascade' }),
	environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' }),
	enabled: boolean().default(true)
})

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	activeOrganizationId: text().references(() => organizations.id, { onDelete: 'set null' }),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const invitation = pgTable('invitation', {
	id: text().notNull().primaryKey(),
	email: text().notNull(),
	inviterId: text().references(() => user.id, { onDelete: 'set null' }),
	organizationid: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	role: text().notNull(),
	status: text().notNull(),
	createdAt: timestamp().notNull().defaultNow(),
	expiresAt: timestamp().notNull(),
})

export const member = pgTable('member', {
	id: text().notNull().primaryKey(),
	userId: text().notNull().references(() => user.id, { onDelete: 'cascade' }),
	organizationId: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	role: text().notNull(),
	createdAt: timestamp().defaultNow().notNull()
});

export const subscriptionTiers = pgEnum('billing_plans', ['basic', 'standard', 'enterprise']);

export const organizations = pgTable('organization', {
	id: text().notNull().primaryKey(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	metadata: text(),
	createdAt: timestamp().defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'date' }).defaultNow().notNull().$onUpdateFn(() => new Date()),
});

export const subscriptions = pgTable('subscriptions', {
	organization: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	currentTier: subscriptionTiers().notNull().default('basic'),
	createdAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp({ mode: 'date' }).notNull().defaultNow(),
	lastInvoiceDate: timestamp(),
	invoicingInterval: interval().notNull()
});

export const invoiceStatus = pgEnum('invoice_status', ['pending-issue', 'issued', 'cancelled', 'completed'])

export const invoices = pgTable('invoices', {
	number: bigserial({ mode: 'number' }).primaryKey().notNull(),
	createdAt: timestamp({ mode: 'date' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
	issuedAt: timestamp({ mode: 'date' }),
	tax: real().notNull().default(0),
	percentageTax: real().default(0).notNull(),
	status: invoiceStatus().notNull().default('pending-issue'),
	issuedTo: text().references(() => user.id, { onDelete: 'set null' }),
});

export const invoiceItems = pgTable('invoice_items', {
	invoice: bigint({ mode: 'number' }).notNull().references(() => invoices.number, { onDelete: 'cascade' }),
	quantity: integer().notNull().default(1),
	price: uuid().notNull().references(() => prices.id)
});

export const prices = pgTable('prices', {
	id: uuid().defaultRandom().primaryKey(),
	value: real().notNull(),
	currency: varchar({ length: 3 }).notNull(),
	exchangeRate: real()
});

export const pgAgents = pgView('vw_agents').as(qb => {
	return qb.select({
		id: agents.id,
		name: agents.name,
		currentIp: agents.currentIp,
		ping: agents.ping,
		isOnline: sql<boolean>`${agents.ping} > 0`.as('is_online'),
		environment: agents.environment
	})
		.from(agents)
});