import { defineMiddleware } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineMiddleware((event, next) => {
  const path = event.url.pathname || "";
  if (!path.startsWith("/api")) {
    return next();
  }

  const config = useRuntimeConfig();
  const allowed = new Set(
    [
      "https://web-q5mf.onrender.com",
      config.frontendOrigin,
      ...(config.corsOrigins ? String(config.corsOrigins).split(",") : []),
    ]
      .map((v) =>
        String(v || "")
          .trim()
          .replace(/\/+$/, ""),
      )
      .filter(Boolean),
  );

  const origin = (event.req.headers.get("origin") || "")
    .trim()
    .replace(/\/+$/, "");
  if (origin && allowed.has(origin)) {
    event.res.headers.set("Access-Control-Allow-Origin", origin);
    event.res.headers.set("Access-Control-Allow-Credentials", "true");
    event.res.headers.set("Vary", "Origin");
  }

  if (event.req.method === "OPTIONS") {
    event.res.headers.set(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    );
    event.res.headers.set(
      "Access-Control-Allow-Headers",
      event.req.headers.get("access-control-request-headers") ||
        "Content-Type,x-project",
    );
    event.res.status = 204;
    return;
  }
  return next();
});
