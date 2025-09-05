ALTER TYPE "public"."sync_transports" RENAME TO "transports";--> statement-breakpoint
CREATE TABLE "client_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
DROP TABLE "platforms" CASCADE;--> statement-breakpoint
DROP TYPE "public"."platform_types";