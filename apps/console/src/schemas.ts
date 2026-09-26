import { z } from 'zod';

export const Principal = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  image: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AuthState = z.object({
  user: Principal.optional(),
  signedIn: z.boolean().default(false),
  sessionExpiresAt: z.coerce.date().optional(),
  activeOrganizationId: z.string().optional()
});

export const ThemeMode = z.enum(['system', 'dark', 'light']);

export const ProjectState = z.object({
  activeProject: z.uuid().optional(),
});
