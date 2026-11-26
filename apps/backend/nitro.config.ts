import { defineConfig } from "nitro";

const rawOrigins = [
  "https://web-q5mf.onrender.com",
  ...(process.env.NITRO_CORS_ORIGINS?.split(",") ?? []),
];
const allowedOrigins = Array.from(
  new Set(rawOrigins.map((o) => o.trim().replace(/\/+$/, "")).filter(Boolean)),
);
console.log(allowedOrigins);
export default defineConfig({
  serverDir: "./server",
  experimental: {
    openAPI: true,
    envExpansion: true,
  },
  routeRules: {
    "/api/**": {
      cors: {
        credentials: true,
        origin: allowedOrigins,
        allowHeaders: ["Content-Type", "x-project"],
        methods: ["GET", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],
        preflight: { statusCode: 200 },
      },
    },
  },
  openAPI: {
    meta: {
      title: "Envo API",
      version: "1.0.0",
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
  },
});
