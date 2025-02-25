DROP INDEX "features_key_env_uq_idx";

DROP INDEX "env_name_uq_idx";

ALTER TABLE credentials
    DROP CONSTRAINT "credentials_owner_users_id_fk";

ALTER TABLE projects
    DROP CONSTRAINT "projects_owner_users_id_fk";

ALTER TABLE environments
    DROP CONSTRAINT "environments_project_projects_id_fk";

ALTER TABLE variables
    DROP CONSTRAINT "variables_env_environments_id_fk";

ALTER TABLE features
    DROP CONSTRAINT "features_env_environments_id_fk";

DROP TRIGGER IF EXISTS update_your_features_updated_at ON features;

DROP TRIGGER IF EXISTS update_your_features_updated_at ON variables;

DROP TRIGGER IF EXISTS update_your_features_updated_at ON environments;

DROP TRIGGER IF EXISTS update_your_features_updated_at ON projects;

DROP TRIGGER IF EXISTS update_your_features_updated_at ON credentials;

DROP TRIGGER IF EXISTS update_your_features_updated_at ON users;

DROP FUNCTION IF EXISTS update_updated_at;

DROP TABLE users;

DROP TABLE credentials;

DROP TYPE credential_provider;

DROP TABLE projects;

DROP TABLE environments;

DROP TABLE variables;

DROP TABLE features;