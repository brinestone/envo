DROP VIEW "public"."vw_agents";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "refillInterval" TO "refill_interval";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "refillAmount" TO "refill_amount";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "lastRefillAt" TO "last_refill_at";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "rateLimitEnabled" TO "rate_limit_enabled";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "rateLimitTimeWindow" TO "rate_limit_time_window";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "rateLimitMax" TO "rate_limit_max";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "requestCount" TO "request_count";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "lastRequest" TO "last_request";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "api_keys" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "environments" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "environments" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "environments" RENAME COLUMN "isDefault" TO "is_default";--> statement-breakpoint
ALTER TABLE "events" RENAME COLUMN "recordedAt" TO "recorded_at";--> statement-breakpoint
ALTER TABLE "feature_overrides" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "feature_overrides" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "feature_overrides" RENAME COLUMN "scheduledEnable" TO "scheduled_enable";--> statement-breakpoint
ALTER TABLE "feature_flags" RENAME COLUMN "displayName" TO "display_name";--> statement-breakpoint
ALTER TABLE "feature_flags" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "feature_flags" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "invitation" RENAME COLUMN "inviterId" TO "inviter_id";--> statement-breakpoint
ALTER TABLE "invitation" RENAME COLUMN "organizationid" TO "organization_id";--> statement-breakpoint
ALTER TABLE "invitation" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "invitation" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "issuedAt" TO "issued_at";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "percentageTax" TO "percentage_tax";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "issuedTo" TO "issued_to";--> statement-breakpoint
ALTER TABLE "member" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "member" RENAME COLUMN "organizationId" TO "organization_id";--> statement-breakpoint
ALTER TABLE "member" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "organization" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "organization" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "platforms" RENAME COLUMN "currentIp" TO "current_ip";--> statement-breakpoint
ALTER TABLE "platforms" RENAME COLUMN "syncTransport" TO "sync_transports";--> statement-breakpoint
ALTER TABLE "platforms" RENAME COLUMN "syncParams" TO "sync_params";--> statement-breakpoint
ALTER TABLE "prices" RENAME COLUMN "exchangeRate" TO "exchange_rate";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "projects" RENAME COLUMN "createdBy" TO "created_by";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "currentTier" TO "current_tier";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "lastInvoiceDate" TO "last_invoice_date";--> statement-breakpoint
ALTER TABLE "subscriptions" RENAME COLUMN "invoicingInterval" TO "invoicing_interval";--> statement-breakpoint
ALTER TABLE "variable_overrides" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "variable_overrides" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "variables" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "variables" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "variables" RENAME COLUMN "isSecret" TO "is_secret";--> statement-breakpoint
ALTER TABLE "variables" RENAME COLUMN "fallbackValue" TO "fallback_value";--> statement-breakpoint
ALTER TABLE "feature_overrides" DROP CONSTRAINT "enabledOrDate";--> statement-breakpoint
ALTER TABLE "api_keys" DROP CONSTRAINT "api_keys_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_inviterId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "invitation" DROP CONSTRAINT "invitation_organizationid_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_issuedTo_user_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "member" DROP CONSTRAINT "member_organizationId_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_createdBy_member_id_fk";
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "variables" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_issued_to_user_id_fk" FOREIGN KEY ("issued_to") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variables" ADD CONSTRAINT "variables_created_by_member_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."member"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_overrides" ADD CONSTRAINT "enabledOrDate" CHECK ((("feature_overrides"."enabled" is null and "feature_overrides"."scheduled_enable" is not null) or ("feature_overrides"."scheduled_enable" is null and "feature_overrides"."enabled" is not null)));--> statement-breakpoint
CREATE VIEW "public"."vw_agents" AS (select "id", "name", "current_ip", "ping", "ping" > 0 as "is_online", "environment" from "platforms");