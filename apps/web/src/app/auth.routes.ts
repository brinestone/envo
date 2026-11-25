import { Routes } from '@angular/router';
import { anonymousGuard } from './guards/auth/anonymous-guard';

const requireAnonymous = anonymousGuard('/console');
export const authRoutes: Routes = [
  {
    canActivate: [requireAnonymous],
    path: 'login',
    title: 'Sign in to Your Account',
    loadComponent: () => import('./pages/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    canActivate: [requireAnonymous],
    path: 'register',
    title: 'Join us Today',
    loadComponent: () => import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'oauth-callback',
    title: 'Signing you in',
    loadComponent: () =>
      import('./pages/auth/oauth-finish/oauth-finish.page').then((m) => m.OauthFinishPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
