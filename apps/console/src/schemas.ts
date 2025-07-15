import { z } from 'zod';

export const ThemeModeSchema = z.enum(['system', 'dark', 'light']);
