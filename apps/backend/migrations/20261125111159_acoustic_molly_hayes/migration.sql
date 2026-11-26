DROP VIEW "vw_project_lookups";--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "active_project" text;--> statement-breakpoint
CREATE INDEX "session_active_project_index" ON "session" ("active_project") WHERE ("active_project" is not null);--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_active_project_projects_id_fkey" FOREIGN KEY ("active_project") REFERENCES "projects"("id") ON DELETE SET NULL;