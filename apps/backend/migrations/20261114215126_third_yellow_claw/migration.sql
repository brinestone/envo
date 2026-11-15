CREATE TABLE "outbox" (
	"id" text PRIMARY KEY,
	"processed_at" timestamp with time zone,
	"event_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"trace_id" text NOT NULL,
	"processor" text NOT NULL,
	"output" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "configs" ADD COLUMN "trace_id" text NOT NULL;--> statement-breakpoint
CREATE INDEX "configs_trace_id_index" ON "configs" ("trace_id");--> statement-breakpoint
CREATE INDEX "outbox_event_key_index" ON "outbox" ("event_key");--> statement-breakpoint
CREATE INDEX "outbox_trace_id_index" ON "outbox" ("trace_id");--> statement-breakpoint
CREATE INDEX "outbox_processed_at_index" ON "outbox" ("processed_at") WHERE ("processed_at" is not null);