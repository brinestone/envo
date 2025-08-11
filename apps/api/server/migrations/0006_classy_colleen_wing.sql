CREATE TABLE "feature_zone_overrides" (
	"feature" uuid NOT NULL,
	"zoneId" text NOT NULL,
	"enabled" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "environment_configs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "environment_features" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "environment_configs" CASCADE;--> statement-breakpoint
DROP TABLE "environment_features" CASCADE;--> statement-breakpoint
ALTER TABLE "features" RENAME TO "feature_flags";--> statement-breakpoint
ALTER TABLE "feature_flags" DROP CONSTRAINT "features_project_projects_id_fk";
--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "signature" text NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "displayName" text;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "enabled" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_zone_overrides" ADD CONSTRAINT "feature_zone_overrides_feature_feature_flags_id_fk" FOREIGN KEY ("feature") REFERENCES "public"."feature_flags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD CONSTRAINT "feature_flags_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_flags" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "feature_flags" DROP COLUMN "label";