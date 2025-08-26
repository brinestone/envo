ALTER TABLE "environments" ALTER COLUMN "isDefault" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "environments" ALTER COLUMN "isDefault" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "environments" ADD COLUMN "enabled" boolean DEFAULT true;