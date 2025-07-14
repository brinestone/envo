CREATE TABLE "environment_configs" (
	"secret" uuid NOT NULL,
	"environment" uuid NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "environment_features" (
	"feature" uuid NOT NULL,
	"environment" uuid NOT NULL,
	"enabled" boolean
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"label" text,
	"project" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"createdBy" text
);
--> statement-breakpoint
ALTER TABLE "values" DROP CONSTRAINT "values_environment_environments_id_fk";
--> statement-breakpoint
ALTER TABLE "values" DROP CONSTRAINT "values_name_environment_pk";--> statement-breakpoint
ALTER TABLE "values" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "environments" ADD COLUMN "project" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "project" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "meta" jsonb;--> statement-breakpoint
ALTER TABLE "values" ADD COLUMN "project" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "environment_configs" ADD CONSTRAINT "environment_configs_secret_values_id_fk" FOREIGN KEY ("secret") REFERENCES "public"."values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_configs" ADD CONSTRAINT "environment_configs_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_features" ADD CONSTRAINT "environment_features_feature_features_id_fk" FOREIGN KEY ("feature") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environment_features" ADD CONSTRAINT "environment_features_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_organization_organization_id_fk" FOREIGN KEY ("organization") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_createdBy_member_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."member"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environments" ADD CONSTRAINT "environments_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "values" ADD CONSTRAINT "values_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "environment";--> statement-breakpoint
ALTER TABLE "values" DROP COLUMN "value";