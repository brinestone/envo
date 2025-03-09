CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"_data" jsonb NOT NULL,
	"_expire" varchar,
	"_delete" boolean NOT NULL,
	"_accessed" varchar
);
