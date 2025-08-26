ALTER TABLE "feature_overrides" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "variable_overrides" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."feature_override_type";--> statement-breakpoint
CREATE TYPE "public"."feature_override_type" AS ENUM('ip', 'cidr', 'zone', 'domain', 'environment');--> statement-breakpoint
ALTER TABLE "feature_overrides" ALTER COLUMN "type" SET DATA TYPE "public"."feature_override_type" USING "type"::"public"."feature_override_type";--> statement-breakpoint
ALTER TABLE "variable_overrides" ALTER COLUMN "type" SET DATA TYPE "public"."feature_override_type" USING "type"::"public"."feature_override_type";--> statement-breakpoint
ALTER TABLE "platforms" ALTER COLUMN "currentIp" DROP NOT NULL;