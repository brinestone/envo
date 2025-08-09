import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  organization: z.string(),
  createdAt: z.coerce.date(),
  enabled: z.boolean(),
  updatedAt: z.coerce.date(),
});

export type Project = z.infer<typeof ProjectSchema>;