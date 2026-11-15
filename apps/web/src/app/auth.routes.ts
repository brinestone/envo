import { Routes } from "@angular/router";
import { anonymousGuard } from "./guards/auth/anonymous-guard";

const requireAnonymous = anonymousGuard("/console");
export const authRoutes: Routes = [
  {
    canActivate: [requireAnonymous],
    path: "login",
    title: "Sign into Your Account",
    loadComponent: () => import("./pages/auth/login/login.page").then((m) => m.LoginPage),
  },
  {
    canActivate: [requireAnonymous],
    path: "register",
    title: "Join us Today",
    loadComponent: () => import("./pages/auth/register/register.page").then((m) => m.RegisterPage),
  },
  { path: "", pathMatch: "full", redirectTo: "login" },
];
