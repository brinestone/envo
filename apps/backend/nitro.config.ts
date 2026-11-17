import { defineConfig } from "nitro";

const corsOrigins = process.env.NITRO_CORS_ORIGINS;
export default defineConfig({
  serverDir: "./server",
  experimental: {
    openAPI: true,
    envExpansion: true,
  },
  routeRules: {
    "/api/**": {
      cors: {
        origin: corsOrigins?.split(",") ?? [],
        credentials: true,
        allowHeaders: ['Content-Type', "x-project"],
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
