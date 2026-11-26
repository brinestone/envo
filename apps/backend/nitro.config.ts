import { defineConfig } from "nitro";

export default defineConfig({
  compatibilityDate: "2026-11-26",
  serverDir: "./server",
  experimental: {
    openAPI: true,
    envExpansion: true,
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
      swagger: false,
    },
  },
  runtimeConfig: {
    dbUrl: "",
    frontendOrigin: "",
    corsOrigins: "",
  },
});
