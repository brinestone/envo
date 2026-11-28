import { Routes } from '@angular/router';
import { provideProjectStore } from '@store/project';
import { signedInGuard } from './guards/auth/signed-in-guard';
import { requireActiveOrgGuard } from './guards/require-active-org-guard';
import { provideOrganizationStore } from '@store/organization';

const requireSignedIn = signedInGuard('/auth/login');
const requireActiveOrg = requireActiveOrgGuard('/organizations');
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth.routes').then((m) => m.authRoutes),
    loadComponent: () => import('./layouts/auth/auth.layout').then((m) => m.AuthLayout),
  },
  {
    path: 'account',
    loadChildren: () => import('./account.routes').then((m) => m.accountRoutes),
    loadComponent: () => import('./layouts/account/account.layout').then((m) => m.AccountLayout),
    canActivate: [requireSignedIn],
    canActivateChild: [requireSignedIn],
  },
  // {
  //   path: ''
  // },
  {
    path: 'organizations',
    providers: [provideOrganizationStore()],
    canActivate: [requireSignedIn],
    title: 'Select an organization',
    loadComponent: () =>
      import('./pages/organizations/organizations.page').then((m) => m.OrganizationsPage),
  },
  {
    path: 'console',
    providers: [provideOrganizationStore(), provideProjectStore()],
    runGuardsAndResolvers: 'always',
    canActivate: [requireSignedIn, requireActiveOrg],
    canActivateChild: [requireSignedIn, requireActiveOrg],
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
