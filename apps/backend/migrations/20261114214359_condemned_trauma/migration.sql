ALTER TABLE "events" ADD COLUMN "user_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "traceId" text NOT NULL;--> statement-breakpoint
CREATE INDEX "events_traceId_index" ON "events" ("traceId");--> statement-breakpoint
CREATE INDEX "events_user_id_index" ON "events" ("user_id") WHERE ("user_id" is not null);--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL;