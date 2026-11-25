import { Routes } from '@angular/router';
import { signedInGuard } from './guards/auth/signed-in-guard';
import { provideOrganizationStore } from '@store/organization';

const requireSignedIn = signedInGuard('/auth/login');
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth.routes').then((m) => m.authRoutes),
    loadComponent: () => import('./layouts/auth/auth.layout').then((m) => m.AuthLayout),
  },
  {
    path: 'console',
    providers: [provideOrganizationStore()],
    canActivate: [requireSignedIn],
    canActivateChild: [requireSignedIn],
    loadChildren: () => import('./console.routes').then((m) => m.mainRoutes),
    loadComponent: () => import('./layouts/main/main.layout').then((m) => m.MainLayout),
  },
  { path: '', pathMatch: 'full', redirectTo: 'console' },
  {
    path: '**',
    title: 'Page or resource not found',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
