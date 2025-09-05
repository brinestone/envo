CREATE TYPE "public"."client_types" AS ENUM('web', 'server', 'function', 'android', 'ios');--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "type" "client_types" NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "secretKey" text NOT NULL;