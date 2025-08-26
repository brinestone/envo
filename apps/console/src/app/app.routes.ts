import { Routes } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { heroClock } from '@ng-icons/heroicons/outline';
import { lucideList, lucideReceipt, lucideServer, lucideSettings, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { SESSION_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { PROJECTS, provideProjectState } from '@state/project';
import { hasActiveProjectGuard } from './guards/active-project.guard';
import { signedInGuard } from './guards/signed-in.guard';
import { AboutPage } from './pages/about/about.page';
import { NotFoundPage } from './pages/not-found/not-found.page';

const authGuard = signedInGuard('/auth');
const projectState = provideProjectState(withStorageFeature([
  { key: PROJECTS, engine: SESSION_STORAGE_ENGINE }
]));

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    loadComponent: () => import('./layouts/auth/auth.layout').then(m => m.AuthLayout)
  },
  {
    path: 'projects',
    data: {
      menuItems: [
        { route: '', icon: 'lucideList', label: 'Projects' },
        { route: '/billing', icon: 'lucideReceipt', label: 'Billing' }
      ]
    },
    canActivate: [authGuard],
    providers: [
      projectState,
      provideIcons({
        lucideList,
        lucideReceipt
      })
    ],
    loadComponent: () => import('./layouts/base/base.layout').then(m => m.BaseLayout),
    loadChildren: () => import('./projects.routes').then(m => m.projectRoutes),
  },
  {
    path: 'projects/current',
    canActivate: [authGuard, hasActiveProjectGuard('/projects')],
    data: {
      menuItems: [
        { route: '/projects', label: 'All Projects', icon: 'lucideList', routerLinkActiveOptions: { exact: true } },
        { separator: true },
        { route: 'configs', icon: 'lucideSlidersHorizontal', label: 'Configurations' },
        { route: 'environments', icon: 'lucideServer', label: 'Environments' },
        { route: 'events', icon: 'heroClock', label: 'Events' },
        { route: 'settings', icon: 'lucideSettings', label: 'Settings' },
      ]
    },
    providers: [
      projectState,
      provideIcons({
        lucideList,
        heroClock,
        lucideSlidersHorizontal,
        lucideServer,
        lucideSettings,
      })
    ],
    loadComponent: () => import('./layouts/base/base.layout').then(m => m.BaseLayout),
    loadChildren: () => import('./configs.routes').then(m => m.configRoutes)
  },
  {
    path: 'billing',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/base/base.layout').then(m => m.BaseLayout),
    loadChildren: () => import('./billing.routes').then(m => m.billingRoutes)
  },
  { path: 'about', title: 'About', component: AboutPage },
  { path: '', redirectTo: 'projects/current', pathMatch: 'full' },
  { path: '**', title: 'Page not found', component: NotFoundPage }
];
