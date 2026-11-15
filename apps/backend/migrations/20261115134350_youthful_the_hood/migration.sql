CREATE TABLE "environments" (
	"name" text,
	"label" text,
	"project" text,
	CONSTRAINT "environments_pkey" PRIMARY KEY("name","project")
);
--> statement-breakpoint
ALTER TABLE "environments" ADD CONSTRAINT "environments_project_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "projects"("id") ON DELETE CASCADE;