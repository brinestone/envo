import { z } from "zod";
import { AuthStateSchema, PrincipalSchema, ProjectStateSchema, ThemeModeSchema } from "./schemas";

export type ThemeMode = z.infer<typeof ThemeModeSchema>;
export type AuthStateModel = z.infer<typeof AuthStateSchema>;
export type Principal = z.infer<typeof PrincipalSchema>;
export type ProjectStateModel = z.infer<typeof ProjectStateSchema>;
