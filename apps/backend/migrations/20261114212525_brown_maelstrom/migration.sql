CREATE TABLE "configs" (
	"project" text,
	"key" text,
	"label" text,
	"value" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "configs_pkey" PRIMARY KEY("project","key")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
DROP TABLE "events";--> statement-breakpoint
CREATE INDEX "configs_project_index" ON "configs" ("project");--> statement-breakpoint
CREATE INDEX "configs_key_index" ON "configs" ("key");--> statement-breakpoint
CREATE INDEX "configs_version_index" ON "configs" ("version");--> statement-breakpoint
CREATE INDEX "configs_project_key_index" ON "configs" ("project","key");--> statement-breakpoint
CREATE INDEX "configs_key_version_index" ON "configs" ("key","version");--> statement-breakpoint
CREATE INDEX "configs_created_at_index" ON "configs" ("created_at");--> statement-breakpoint
CREATE INDEX "configs_updated_at_index" ON "configs" ("updated_at");--> statement-breakpoint
CREATE INDEX "configs_deleted_at_index" ON "configs" ("deleted_at") WHERE ("deleted_at" is null);--> statement-breakpoint
CREATE UNIQUE INDEX "configs_project_key_version_index" ON "configs" ("project","key","version") WHERE ("deleted_at" is not null);--> statement-breakpoint
CREATE INDEX "projects_organization_index" ON "projects" ("organization");--> statement-breakpoint
CREATE INDEX "projects_created_by_index" ON "projects" ("created_by");--> statement-breakpoint
CREATE INDEX "projects_updated_at_index" ON "projects" ("updated_at");--> statement-breakpoint
CREATE INDEX "projects_created_at_index" ON "projects" ("created_at");--> statement-breakpoint
ALTER TABLE "configs" ADD CONSTRAINT "configs_project_projects_id_fkey" FOREIGN KEY ("project") REFERENCES "projects"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_member_id_fkey" FOREIGN KEY ("created_by") REFERENCES "member"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_organization_id_fkey" FOREIGN KEY ("organization") REFERENCES "organization"("id") ON DELETE CASCADE;