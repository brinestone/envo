CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();

    RETURN NEW;
END

$$ LANGUAGE plpgsql;

DO
$$
    BEGIN
        CREATE TABLE
            features
        (
            "id"         uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            "created_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "key"        VARCHAR(100)     NOT NULL,
            "name"       VARCHAR(100)     NOT NULL,
            "is_enabled" BOOLEAN                   DEFAULT TRUE,
            "env"        uuid             NOT NULL
        );

        CREATE TABLE
            variables
        (
            "id"         uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            "created_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "env"        uuid             NOT NULL,
            "value"      text             NOT NULL DEFAULT '',
            "name"       VARCHAR          NOT NULL
        );

        CREATE TABLE
            environments
        (
            "id"         uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            "created_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "name"       VARCHAR(100)     NOT NULL,
            "project"    uuid             NOT NULL
        );

        CREATE TABLE
            projects
        (
            "id"         uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            "created_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "name"       VARCHAR(100)     NOT NULL,
            "owner"      uuid             NOT NULL
        );

        CREATE TYPE credential_provider AS ENUM ('google', 'local', 'microsoft');

        CREATE TABLE
            credentials
        (
            "id"           varchar(100) PRIMARY KEY NOT NULL,
            "created_at"   TIMESTAMP                NOT NULL DEFAULT now(),
            "updated_at"   TIMESTAMP                NOT NULL DEFAULT now(),
            "provider"     credential_provider      NOT NULL,
            "access_token" varchar(256)             NOT NULL,
            "params"       jsonb,
            "owner"        uuid
        );

        CREATE TABLE
            users
        (
            "id"         uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
            "created_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP        NOT NULL DEFAULT now(),
            "name"       VARCHAR(100)     NOT NULL,
            "image"      TEXT
        );

        CREATE UNIQUE INDEX "features_key_env_uq_idx" ON features ("key", "env");

        CREATE UNIQUE INDEX "env_name_uq_idx" ON variables ("env", "name");

        ALTER TABLE credentials
            ADD CONSTRAINT "credentials_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "users" ("id") ON DELETE CASCADE;

        ALTER TABLE projects
            ADD CONSTRAINT "projects_owner_users_id_fk" FOREIGN KEY ("owner") REFERENCES "users" ("id") ON DELETE CASCADE;

        ALTER TABLE environments
            ADD CONSTRAINT "environments_project_projects_id_fk" FOREIGN KEY ("project") REFERENCES "projects" ("id") ON DELETE CASCADE;

        ALTER TABLE variables
            ADD CONSTRAINT "variables_env_environments_id_fk" FOREIGN KEY ("env") REFERENCES "environments" ("id") ON DELETE CASCADE;

        ALTER TABLE features
            ADD CONSTRAINT "features_env_environments_id_fk" FOREIGN KEY ("env") REFERENCES "environments" ("id") ON DELETE CASCADE;
    END;
$$ LANGUAGE plpgsql;