DROP VIEW "public"."vw_agents";--> statement-breakpoint
ALTER TABLE "agents" RENAME TO "platforms";--> statement-breakpoint
ALTER TABLE "platforms" DROP CONSTRAINT "agents_environment_environments_id_fk";
--> statement-breakpoint
ALTER TABLE "platforms" ADD CONSTRAINT "platforms_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE VIEW "public"."vw_agents" AS (select "id", "name", "currentIp", "ping", "ping" > 0 as "is_online", "environment" from "platforms");