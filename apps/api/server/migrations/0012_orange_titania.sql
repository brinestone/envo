ALTER TYPE "public"."feature_override_type" ADD VALUE 'domain';--> statement-breakpoint
ALTER TYPE "public"."feature_override_type" ADD VALUE 'environment';--> statement-breakpoint
CREATE TABLE "variable_overrides" (
	"variable" uuid NOT NULL,
	"meta" jsonb NOT NULL,
	"type" "feature_override_type" NOT NULL,
	"value" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "values" RENAME TO "vars";--> statement-breakpoint
ALTER TABLE "vars" DROP CONSTRAINT "values_project_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "variable_overrides" ADD CONSTRAINT "variable_overrides_variable_vars_id_fk" FOREIGN KEY ("variable") REFERENCES "public"."vars"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vars" ADD CONSTRAINT "vars_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;