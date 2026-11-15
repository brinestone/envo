ALTER TABLE "configs" DROP CONSTRAINT "configs_pkey";--> statement-breakpoint
ALTER TABLE "outbox" ALTER COLUMN "processor" DROP NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "configs_project_key_version_index" ON "configs" ("project","key","version") WHERE ("deleted_at" is not null);