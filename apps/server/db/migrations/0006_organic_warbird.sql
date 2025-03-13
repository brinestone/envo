CREATE TYPE "public"."project_member_roles" AS ENUM('owner', 'member', 'admin');--> statement-breakpoint
CREATE TABLE "projects_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"project" uuid NOT NULL,
	"role" "project_member_roles" DEFAULT 'member'
);
--> statement-breakpoint
ALTER TABLE "projects_memberships" ADD CONSTRAINT "projects_memberships_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;