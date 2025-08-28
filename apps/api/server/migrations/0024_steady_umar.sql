ALTER TABLE "events" DROP CONSTRAINT "events_organization_organization_id_fk";
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "organization" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "isServiceAccount" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organization_organization_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;