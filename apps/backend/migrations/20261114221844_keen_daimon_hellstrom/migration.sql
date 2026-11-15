DROP INDEX "configs_project_key_version_index";--> statement-breakpoint
ALTER TABLE "configs" DROP CONSTRAINT "configs_pkey";--> statement-breakpoint
ALTER TABLE "configs" ADD PRIMARY KEY ("project","key","version");