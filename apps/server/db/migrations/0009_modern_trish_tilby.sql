ALTER TABLE "configurations" ADD COLUMN "project" uuid;--> statement-breakpoint
ALTER TABLE "features" ADD COLUMN "project" uuid;--> statement-breakpoint
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;