import { logger } from "@bogeychan/elysia-logger";
import { cors } from '@elysiajs/cors';
import { swagger } from "@elysiajs/swagger";
import { db } from "@helpers/db";
import { Elysia, t } from "elysia";
import { authPlugin } from "./api/auth";
import { activateEnvironmentVersionSchema, detailedEnvironmentSchema, environmentLookupSchema, environmentVersionSchema, handleActivateEnvironmentVersion, handleCreateEnvironmentVersion, handleCreateProjectEnvironment, handleFindEnvironmentById, handleFindEnvironmentVersions, handleFindProjectEnvironments, handleToggleEnvironmentStatus, newEnvironmentSchema } from "./api/environments";
import { detailedProjectSchema, handleCreateNewProject, handleFindProjectById, handleGetProjects, isProjectAccessible, newProjectSchema, projectLookupSchema } from "./api/projects";

const app = new Elysia({ prefix: '/api' })
  .decorate('db', db)
  .use(
    logger({
      level: "info",
    })
  )
  .use(cors({
    origin: Bun.env.FRONT_END_ORIGIN as string,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }))
  .use(authPlugin)
  .group('/projects', g => g
    .get('/', handleGetProjects, {
      auth: true, tags: ['Projects'],
      response: t.Array(projectLookupSchema),
      detail: {
        summary: 'All Projects',
        description: 'Retrieves all projects with valid membership of the user',
      },
    })
    .post('/', handleCreateNewProject, {
      body: newProjectSchema,
      auth: true,
      tags: ['Projects'],
      detail: {
        summary: 'Create Project',
        description: 'Creates a project with the user as owner',
        responses: {
          '201': {
            description: 'The project was created successfully'
          }
        }
      }
    })
    .get('/:project', handleFindProjectById,
      {
        auth: true,
        response: {
          200: detailedProjectSchema,
          404: t.Null()
        },
        tags: ['Projects'],
        detail: {
          responses: {
            '200': { description: 'The project was found' },
            '400': { description: 'The project was not found  ' }
          },
          summary: 'Find a project by ID',
          description: 'Retrieve a project using it\'s ID and that the user has an active membership with.'
        }
      }
    )
    .group('/:project/environments', g => {
      return g
        .put('/toggle/:env', handleToggleEnvironmentStatus, {
          auth: true,
          params: t.Object({
            project: t.String({ format: 'uuid' }),
            env: t.String({ format: 'uuid' })
          }),
          beforeHandle: isProjectAccessible,
          tags: ['Environments'],
          detail: {
            summary: 'Toggle environment status'
          }
        })
        .get('/', handleFindProjectEnvironments, {
          response: t.Array(environmentLookupSchema),
          params: t.Object({
            project: t.String({ format: 'uuid' })
          }),
          auth: true,
          tags: ['Environments'],
          detail: {
            summary: 'Get a project\'s environments',
          }
        })
        .post('/', handleCreateProjectEnvironment, {
          auth: true,
          params: t.Object({
            project: t.String({ format: 'uuid' })
          }),
          tags: ['Environments'],
          detail: {
            summary: 'Create environment'
          }
        })
        .get('/:env', handleFindEnvironmentById, {
          response: detailedEnvironmentSchema,
          params: t.Object({
            project: t.String({ format: 'uuid' }),
            env: t.String({ format: 'uuid' }),
          }),
          auth: true,
          beforeHandle: isProjectAccessible,
          tags: ['Environments'],
          detail: {
            summary: "Find an environment by ID"
          }
        })
    })
    .group(':project/environments/:env/versions', g => {
      return g
        .get('/', handleFindEnvironmentVersions, {
          response: t.Array(environmentVersionSchema),
          auth: true,
          beforeHandle: isProjectAccessible,
          tags: ['Environments'],
          detail: {
            summary: 'Environment Versions'
          }
        })
        .post('/', handleCreateEnvironmentVersion, {
          params: t.Object({
            project: t.String({ format: 'uuid' }),
            env: t.String({ format: 'uuid' }),
          }),
          body: newEnvironmentSchema,
          response: environmentVersionSchema,
          auth: true,
          beforeHandle: isProjectAccessible,
          tags: ['Environments'],
          detail: {
            summary: 'Create Environment Version'
          }
        })
        .put('/activate', handleActivateEnvironmentVersion, {
          params: t.Object({
            project: t.String({ format: 'uuid' }),
            env: t.String({ format: 'uuid' }),
          }),
          body: activateEnvironmentVersionSchema,
          response: t.Array(environmentVersionSchema),
          auth: true,
          beforeHandle: isProjectAccessible,
          tags: ['Environments'],
          detail: {
            summary: 'Activate Environment Version'
          }
        })
    })
  )
  .use(swagger({
    documentation: {
      info: {
        title: 'Envo API',
        version: '1.0'
      },
      tags: [
        { name: 'General', description: 'General or public endpoints' },
        { name: 'Auth', description: 'Endpoints for user authentication' },
        { name: 'Projects', description: 'Endpoints for projects' },
        { name: 'Environments', description: 'Endpoints for project environments' }
      ]
    }
  }))
  .listen(process.env.PORT ?? 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
