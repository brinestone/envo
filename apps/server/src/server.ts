import { logger } from "@bogeychan/elysia-logger";
import { cors } from '@elysiajs/cors';
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { authEndpoints } from "./api/auth";

const app = new Elysia({ prefix: '/api' })
  .use(
    logger({
      level: "info",
    })
  )
  .use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(authEndpoints)
  .use(swagger({
    documentation: {
      info: {
        title: 'Envo API',
        version: '1.0'
      },
      tags: [
        { name: 'General', description: 'General or public endpoints' },
        { name: 'Auth', description: 'Endpoints for user authentication' }
      ]
    }
  }))
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
