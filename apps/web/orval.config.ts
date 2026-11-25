import { defineConfig } from 'orval';
export default defineConfig({
  envo: {
    output: {
      mode: 'tags-split',
      target: 'libs/api/envo/services',
      schemas: {
        path: 'libs/api/envo/models',
        type: 'zod',
      },
      operationSchemas: 'libs/api/envo/payloads',
      client: 'angular',
      clean: true,
      override: {
        angular: {
          runtimeValidation: true,
          retrievalClient: 'both',
        },
      },
    },
    input: {
      target: 'http://localhost:3000/_docs/openapi.json',
      filters: {
        tags: ['Internal', 'API Routes'],
        mode: 'exclude',
      },
    },
  },
});
