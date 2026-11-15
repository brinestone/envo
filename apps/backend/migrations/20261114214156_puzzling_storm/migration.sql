CREATE TABLE "events" (
	"id" text PRIMARY KEY,
	"target" text NOT NULL,
	"target_type" text NOT NULL,
	"organization" text,
	"triggered_by" text,
	"note" text NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "events_target_index" ON "events" ("target");--> statement-breakpoint
CREATE INDEX "events_organization_index" ON "events" ("organization") WHERE ("organization" is not null);--> statement-breakpoint
CREATE INDEX "events_triggered_by_index" ON "events" ("triggered_by") WHERE ("triggered_by" is not null);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organization_organization_id_fkey" FOREIGN KEY ("organization") REFERENCES "organization"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_triggered_by_member_id_fkey" FOREIGN KEY ("triggered_by") REFERENCES "member"("id") ON DELETE SET NULL;