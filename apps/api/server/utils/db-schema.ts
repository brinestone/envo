import { EnvironmentTypeSchema, PlatformTypeSchema } from "@envo/common";
import { and, isNotNull, isNull, or, sql } from "drizzle-orm";
import { bigint, bigserial, boolean, check, integer, interval, jsonb, pgEnum, pgTable, pgView, real, smallint, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable('projects', {
	id: uuid().notNull().defaultRandom().primaryKey(),
	name: text().notNull(),
	enabled: boolean().default(true).notNull(),
	organization: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
	createdBy: text('created_by').references(() => member.id, { onDelete: 'set null' })
});

export const events = pgTable('events', {
	id: uuid().notNull().defaultRandom().primaryKey(),
	note: text().notNull(),
	code: text(),
	recordedAt: timestamp('recorded_at', { mode: 'date' }).defaultNow(),
	actor: text().references(() => member.id, { onDelete: 'set null' }),
	project: uuid().references(() => projects.id, { onDelete: 'set null' }),
	organization: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	meta: jsonb()
});

export const platformTypes = pgEnum('platform_types', PlatformTypeSchema.enum);
export const syncTransports = pgEnum('sync_transports', ['sse', 'websocket', 'webhook', 'poll', 'pub-sub']);
export const platforms = pgTable('platforms', {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	currentIp: text('current_ip'),
	ping: smallint().default(0),
	type: platformTypes().notNull(),
	syncTransport: syncTransports('sync_transports').notNull(),
	syncParams: jsonb('sync_params').notNull(),
	environment: uuid().notNull().references(() => environments.id, { onDelete: 'cascade' })
});

export const overrideType = pgEnum('feature_override_type', ['ip', 'cidr', 'zone', 'domain', 'environment'])

export const variables = pgTable("variables", {
	id: uuid().notNull().defaultRandom().primaryKey(),
	name: text().notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdate(() => new Date()),
	isSecret: boolean('is_secret').default(false).notNull(),
	fallbackValue: text('fallback_value'),
	createdBy: text('created_by').references(() => member.id),
	project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' })
}, t => [uniqueIndex().on(t.name, t.project)]);

export const variableOverrides = pgTable('variable_overrides', {
	variable: uuid().notNull().references(() => variables.id, { onDelete: 'cascade' }),
	meta: jsonb().notNull(),
	type: overrideType().notNull(),
	value: text(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date())
});

export const features = pgTable('feature_flags', {
	id: uuid().notNull().defaultRandom().primaryKey(),
	signature: text().notNull(),
	displayName: text('display_name'),
	description: text(),
	enabled: boolean().notNull(),
	project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date())
}, t => [uniqueIndex().on(t.signature, t.project)]);

export const featureOverrides = pgTable('feature_overrides', {
	feature: uuid().notNull().references(() => features.id, { onDelete: 'cascade' }),
	meta: jsonb().notNull(),
	type: overrideType().notNull(),
	enabled: boolean(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
	scheduledEnable: timestamp('scheduled_enable',{ mode: 'date' })
}, t => [
	check('enabledOrDate', or(
		and(
			isNull(t.enabled),
			isNotNull(t.scheduledEnable)
		),
		and(
			isNull(t.scheduledEnable),
			isNotNull(t.enabled)
		)
	)
	)
]);

export const environmentTypes = pgEnum('environment_types', EnvironmentTypeSchema.enum);
export const environments = pgTable("environments", {
	id: uuid().primaryKey().notNull().defaultRandom(),
	name: text().notNull(),
	type: environmentTypes().notNull(),
	enabled: boolean().default(true),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
	isDefault: boolean('is_default').notNull(),
	project: uuid().notNull().references(() => projects.id, { onDelete: 'cascade' })
}, t => [uniqueIndex().on(t.name, t.project)]);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),

	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
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
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
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
	inviterId: text('inviter_id').references(() => user.id, { onDelete: 'set null' }),
	organizationid: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	role: text().notNull(),
	status: text().notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	expiresAt: timestamp('expires_at').notNull(),
})

export const member = pgTable('member', {
	id: text().notNull().primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	organizationId: text('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	role: text().notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

export const subscriptionTiers = pgEnum('billing_plans', ['basic', 'standard', 'enterprise']);

export const organizations = pgTable('organization', {
	id: text().notNull().primaryKey(),
	name: text().notNull(),
	slug: text().notNull(),
	logo: text(),
	metadata: text(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
});

export const apiKeys = pgTable('api_keys', {
	id: text().notNull().primaryKey(),
	name: text(),
	start: text(),
	prefix: text(),
	key: text().notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	refillInterval: integer('refill_interval'),
	refillAmount: integer('refill_amount'),
	lastRefillAt: timestamp('last_refill_at',{ mode: 'date' }),
	enabled: boolean().default(true),
	rateLimitEnabled: boolean('rate_limit_enabled').notNull(),
	rateLimitTimeWindow: integer('rate_limit_time_window'),
	rateLimitMax: integer('rate_limit_max'),
	requestCount: integer('request_count').default(0),
	remaining: integer(),
	lastRequest: timestamp('last_request',{ mode: 'date' }),
	expiresAt: timestamp('expires_at',{ mode: 'date' }),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
	permissions: text(),
	metadata: jsonb()
})

export const subscriptions = pgTable('subscriptions', {
	organization: text().notNull().references(() => organizations.id, { onDelete: 'cascade' }),
	currentTier: subscriptionTiers('current_tier').notNull().default('basic'),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
	lastInvoiceDate: timestamp('last_invoice_date'),
	invoicingInterval: interval('invoicing_interval').notNull()
});

export const invoiceStatus = pgEnum('invoice_status', ['pending-issue', 'issued', 'cancelled', 'completed'])

export const invoices = pgTable('invoices', {
	number: bigserial({ mode: 'number' }).primaryKey().notNull(),
	createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().$onUpdateFn(() => new Date()),
	issuedAt: timestamp('issued_at',{ mode: 'date' }),
	tax: real().notNull().default(0),
	percentageTax: real('percentage_tax').default(0).notNull(),
	status: invoiceStatus().notNull().default('pending-issue'),
	issuedTo: text('issued_to').references(() => user.id, { onDelete: 'set null' }),
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
	exchangeRate: real('exchange_rate')
});

export const pgAgents = pgView('vw_agents').as(qb => {
	return qb.select({
		id: platforms.id,
		name: platforms.name,
		currentIp: platforms.currentIp,
		ping: platforms.ping,
		isOnline: sql<boolean>`${platforms.ping} > 0`.as('is_online'),
		environment: platforms.environment
	})
		.from(platforms)
});
