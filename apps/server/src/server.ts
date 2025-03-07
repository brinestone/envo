import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { cors } from '@elysiajs/cors'
import auth from "./api/auth";

const app = new Elysia()
  .use(cors())
  .use(auth)
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
