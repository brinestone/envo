import { Routes } from "@angular/router";

export const authRoutes: Routes = [
  { path: 'login', title: 'Sign into Your Account', loadComponent: () => import('./login/login.page').then(m => m.LoginPage) },
  { path: 'register', title: 'Join us Today', loadComponent: () => import('./register/register.page').then(m => m.RegisterPage) },
  { path: 'reset-password', title: 'Reset Your Password', loadComponent: () => import('./password-reset/password-reset.page').then(m => m.PasswordResetPage) },
  { path: '', pathMatch: 'full', redirectTo: 'login' }
]
