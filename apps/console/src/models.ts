import { UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { z } from "zod";
import { AuthState, Principal, ProjectState, ThemeMode } from "./schemas";

export type ThemeMode = z.infer<typeof ThemeMode>;
export type AuthStateModel = z.infer<typeof AuthState>;
export type Principal = z.infer<typeof Principal>;
export type ProjectStateModel = z.infer<typeof ProjectState>;
export type CanDeactivateType = Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
export interface PendingChanges {
  hasPendingChanges(): CanDeactivateType;
}
