CREATE TABLE "configuration_values" (
	"configName" varchar NOT NULL,
	"environment" uuid NOT NULL,
	"value" text,
	"versionName" varchar NOT NULL,
	CONSTRAINT "configuration_values_configName_environment_versionName_pk" PRIMARY KEY("configName","environment","versionName")
);
--> statement-breakpoint
CREATE TABLE "env_versions" (
	"name" varchar NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"environment" uuid NOT NULL,
	"project" uuid NOT NULL,
	"isActive" boolean DEFAULT false,
	CONSTRAINT "env_versions_name_environment_pk" PRIMARY KEY("name","environment")
);
--> statement-breakpoint
CREATE TABLE "feature_values" (
	"feature" uuid NOT NULL,
	"environment" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "features" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "configuration_values" ADD CONSTRAINT "configuration_values_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_values" ADD CONSTRAINT "configuration_values_configName_environment_configurations_name_environment_fk" FOREIGN KEY ("configName","environment") REFERENCES "public"."configurations"("name","environment") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configuration_values" ADD CONSTRAINT "configuration_values_versionName_environment_env_versions_name_environment_fk" FOREIGN KEY ("versionName","environment") REFERENCES "public"."env_versions"("name","environment") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "env_versions" ADD CONSTRAINT "env_versions_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "env_versions" ADD CONSTRAINT "env_versions_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_values" ADD CONSTRAINT "feature_values_feature_features_id_fk" FOREIGN KEY ("feature") REFERENCES "public"."features"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_values" ADD CONSTRAINT "feature_values_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "configurations" DROP COLUMN "value";