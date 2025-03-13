CREATE TABLE "configurations" (
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"environment" uuid NOT NULL,
	"name" varchar NOT NULL,
	"value" text NOT NULL,
	"secured" boolean DEFAULT true,
	CONSTRAINT "configurations_name_environment_pk" PRIMARY KEY("name","environment")
);
--> statement-breakpoint
CREATE TABLE "environments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"name" varchar NOT NULL,
	"project" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"environment" uuid NOT NULL,
	"name" varchar NOT NULL,
	"enabled" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	"name" varchar NOT NULL,
	"owner" text
);
--> statement-breakpoint
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "environments" ADD CONSTRAINT "environments_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "features" ADD CONSTRAINT "features_environment_environments_id_fk" FOREIGN KEY ("environment") REFERENCES "public"."environments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_user_id_fk" FOREIGN KEY ("owner") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "environments_name_project_index" ON "environments" USING btree ("name","project");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_name_owner_index" ON "projects" USING btree ("name","owner");