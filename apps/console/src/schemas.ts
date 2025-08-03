import { z } from 'zod';

export const PrincipalSchema = z.object({
  id: z.string(),
  email: z.email(),
  name: z.string(),
  image: z.string().nullable().optional(),
  emailVerified: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const AuthStateSchema = z.object({
  user: PrincipalSchema.optional(),
  signedIn: z.boolean().default(false)
});

export const ThemeModeSchema = z.enum(['system', 'dark', 'light']);
