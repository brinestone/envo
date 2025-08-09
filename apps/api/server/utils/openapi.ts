import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export function createOpenApiRequestSchema(schema: z.ZodObject) {
  return {
    content: {
      'application/json': {
        schema: zodToJsonSchema(schema)
      },
    },
    required: true
  }
}