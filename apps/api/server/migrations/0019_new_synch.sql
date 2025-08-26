CREATE TYPE "public"."environment_types" AS ENUM('development', 'production', 'ci', 'staging');--> statement-breakpoint
ALTER TABLE "vars" RENAME TO "variables";--> statement-breakpoint
ALTER TABLE "variable_overrides" DROP CONSTRAINT "variable_overrides_variable_vars_id_fk";
--> statement-breakpoint
ALTER TABLE "variables" DROP CONSTRAINT "vars_project_projects_id_fk";
--> statement-breakpoint
DROP INDEX "vars_name_project_index";--> statement-breakpoint
ALTER TABLE "environments" ADD COLUMN "type" "environment_types" NOT NULL;--> statement-breakpoint
ALTER TABLE "environments" ADD COLUMN "isMain" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "variable_overrides" ADD CONSTRAINT "variable_overrides_variable_variables_id_fk" FOREIGN KEY ("variable") REFERENCES "public"."variables"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variables" ADD CONSTRAINT "variables_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "variables_name_project_index" ON "variables" USING btree ("name","project");