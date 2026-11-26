ALTER TABLE "projects" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
CREATE INDEX "projects_slug_index" ON "projects" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_organization_index" ON "projects" ("slug","organization");