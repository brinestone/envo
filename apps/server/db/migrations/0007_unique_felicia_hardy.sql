ALTER TABLE "projects" DROP CONSTRAINT "projects_owner_user_id_fk";
--> statement-breakpoint
DROP INDEX "projects_name_owner_index";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "owner";