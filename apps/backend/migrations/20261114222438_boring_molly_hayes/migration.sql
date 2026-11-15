ALTER TABLE "configs" DROP CONSTRAINT "configs_pkey";--> statement-breakpoint
ALTER TABLE "configs" ADD PRIMARY KEY ("project","key");