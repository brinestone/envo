import { defineConfig } from "nitro";

const dbUrl = process.env.NITRO_DB_URL;
export default defineConfig({
  serverDir: "./server",
  experimental: {
    openAPI: true,
    envExpansion: true,
  },
  routeRules: {
    "/api/auth/**": {
      cors: {
        origin: dbUrl?.split(",") ?? [],
        credentials: true,
      },
    },
  },
  openAPI: {
    meta: {
      title: "Envo API",
      version: "0.0.0",
    },
    route: "/_docs/openapi.json",
    ui: {
      scalar: {
        route: "/_docs/scalar",
        theme: "bluePlanet",
        showOperationId: true,
      },
    },
  },
  runtimeConfig: {
    dbUrl: "",
    frontendOrigin: "",
  },
});
