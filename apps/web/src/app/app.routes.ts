import { Routes } from '@angular/router';
import { provideProjectStore } from '@store/project';
import { signedInGuard } from './guards/auth/signed-in-guard';

const requireSignedIn = signedInGuard('/auth/login');
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth.routes').then((m) => m.authRoutes),
    loadComponent: () => import('./layouts/auth/auth.layout').then((m) => m.AuthLayout),
  },
  {
    path: 'console',
    providers: [provideProjectStore()],
    runGuardsAndResolvers: 'always',
    canActivate: [requireSignedIn],
    canActivateChild: [requireSignedIn],
    loadChildren: () => import('./main.routes').then((m) => m.mainRoutes),
    loadComponent: () => import('./layouts/main/main.layout').then((m) => m.MainLayout),
  },
  { path: '', pathMatch: 'full', redirectTo: 'console' },
  {
    path: '**',
    title: 'Page or resource not found',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
