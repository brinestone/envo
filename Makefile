include .env
# Directories
BIN_DIR=bin
SERVER_DIR=server
CLI_DIR=cli
AIR_EXCLUDE=templates,build,bin,.git,node_modules,.idea

# OS-specific settings
ifeq ($(OS),Windows_NT)
	SEPARATOR="\\"
    RM=rmdir /Q /S
    MKDIR=if not exist $(BIN_DIR) mkdir
    AIR_BIN=$(shell go env GOPATH)\\bin\\air.exe
    EXE_EXT=.exe
	MIGRATE_BIN=$(shell go env GOPATH)\\bin\\migrate.exe
	MIGRATIONS_DIR="db\\migrations"
else
	MIGRATE_BIN=$(shell go env GOPATH)/bin/migrate
    RM=rm -rf
    MKDIR=mkdir -p
    AIR_BIN=$(shell go env GOPATH)/bin/air
    EXE_EXT=
    SEPARATOR=/
	MIGRATIONS_DIR="db/migrations"
endif

BIN_NAME=app$(EXE_EXT)

# Install Air if not already installed
install-air:
	@if not exist "$(AIR_BIN)" ( \
		echo "Installing Air..."; \
		go install github.com/cosmtrek/air@latest \
	)

db-version: install-migrate
	@powershell -Command "$$migration_version=(Read-Host -Prompt \"Enter the migration version\"); Write-Host 'Setting to migration version' $$migration_version; $(MIGRATE_BIN) -database $(DB_URL) -source file://db/migrations force $$migration_version";

install-migrate:
	@go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

up: install-migrate
	@echo "Running migrations up"
	@$(MIGRATE_BIN) -database $(DB_URL) -source file://db/migrations up

down: install-migrate
	@echo "Running migrations down"
	@$(MIGRATE_BIN) -database $(DB_URL) -source file://db/migrations down 1

new-migration: install-migrate ensure-migrations
		@powershell -Command "$$migration_name = (Read-Host -Prompt \"Enter migration name\"); Write-Host 'Starting migration' $$migration_name; $(MIGRATE_BIN) create -digits 3 -ext sql -dir '$(MIGRATIONS_DIR)' $$migration_name";
# Run both server and CLI in dev mode with Air
dev-server: install-air
	@echo "Starting server in development mode..."
	@$(AIR_BIN) --build.cmd "make build-server" --build.bin ".$(SEPARATOR)$(BIN_DIR)$(SEPARATOR)$(SERVER_DIR)$(SEPARATOR)$(BIN_NAME)" --build.exclude_dir "$(AIR_EXCLUDE),cli"

dev-cli: install-air
	@echo "Starting CLI in development mode..."
	@$(AIR_BIN) --build.cmd "make build-cli" --build.bin ".$(SEPARATOR)$(BIN_DIR)$(SEPARATOR)$(CLI_DIR)$(SEPARATOR)$(BIN_NAME)" --build.exclude_dir "$(AIR_EXCLUDE),server"

build-server: ensure-bin
	@echo "Building server..."
	@cd $(SERVER_DIR) && go build -o ../$(BIN_DIR)/$(SERVER_DIR)/$(BIN_NAME) .

build-cli: ensure-bin
	@echo "Building cli..."
	@cd $(CLI_DIR) && go build -o ../$(BIN_DIR)/$(CLI_DIR)/$(BIN_NAME) .

# Build executables
build: build-cli build-server

# Ensure bin directory exists only if it doesn't already
ensure-bin:
	@$(MKDIR) $(BIN_DIR)

ensure-migrations:
	@$(MKDIR) $(MIGRATIONS_DIR)

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@$(RM) $(BIN_DIR)

.PHONY: dev build clean install-air ensure-bin
