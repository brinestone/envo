CREATE TYPE "public"."feature_override_type" AS ENUM('zone', 'cidr', 'ip');--> statement-breakpoint
CREATE TABLE "feature_overrides" (
	"feature" uuid NOT NULL,
	"meta" jsonb NOT NULL,
	"type" "feature_override_type" NOT NULL,
	"enabled" boolean,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"scheduledEnable" timestamp,
	CONSTRAINT "enabledOrDate" CHECK ((("feature_overrides"."enabled" is null and "feature_overrides"."scheduledEnable" is not null) or ("feature_overrides"."scheduledEnable" is null and "feature_overrides"."enabled" is not null)))
);
--> statement-breakpoint
ALTER TABLE "feature_zone_overrides" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "feature_zone_overrides" CASCADE;--> statement-breakpoint
ALTER TABLE "feature_overrides" ADD CONSTRAINT "feature_overrides_feature_feature_flags_id_fk" FOREIGN KEY ("feature") REFERENCES "public"."feature_flags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feature_flags_signature_project_index" ON "feature_flags" USING btree ("signature","project");