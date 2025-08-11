ALTER TABLE "feature_flags" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "feature_flags" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;