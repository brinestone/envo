import { z } from "zod";
import { ThemeModeSchema } from "./schemas";

export type ThemeMode = z.infer<typeof ThemeModeSchema>;
