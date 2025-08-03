CREATE TYPE "public"."agent_types" AS ENUM('web', 'mobile', 'cli', 'server');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('pending-issue', 'issued', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."billing_plans" AS ENUM('basic', 'standard', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."sync_transports" AS ENUM('sse', 'websocket', 'webhook', 'poll', 'pub-sub');--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"invoice" bigint NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"number" bigserial PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"issuedAt" timestamp,
	"tax" real DEFAULT 0 NOT NULL,
	"percentageTax" real DEFAULT 0 NOT NULL,
	"status" "invoice_status" DEFAULT 'pending-issue' NOT NULL,
	"issuedTo" text
);
--> statement-breakpoint
CREATE TABLE "prices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" real NOT NULL,
	"currency" varchar(3) NOT NULL,
	"exchangeRate" real
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"organization" text NOT NULL,
	"currentTier" "billing_plans" DEFAULT 'basic' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastInvoiceDate" timestamp,
	"invoicingInterval" interval NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "type" "agent_types" NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "syncTransport" "sync_transports" NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "syncParams" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_invoices_number_fk" FOREIGN KEY ("invoice") REFERENCES "public"."invoices"("number") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_price_prices_id_fk" FOREIGN KEY ("price") REFERENCES "public"."prices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_issuedTo_user_id_fk" FOREIGN KEY ("issuedTo") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_organization_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;