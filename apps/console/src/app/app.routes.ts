import { Routes } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideList, lucideReceipt, lucideServer, lucideSettings, lucideSlidersHorizontal } from '@ng-icons/lucide';
import { SESSION_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { PROJECTS, provideProjectState } from '@state/project';
import { hasActiveProjectGuard } from './guards/active-project.guard';
import { signedInGuard } from './guards/signed-in';
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
    path: 'configs',
    canActivate: [authGuard, hasActiveProjectGuard('/projects')],
    data: {
      menuItems: [
        { route: '', icon: 'lucideSlidersHorizontal', label: 'Configs' },
        { route: 'envs', icon: 'lucideServer', label: 'Environments' },
        { route: 'settings', icon: 'lucideSettings', label: 'Settings' },
      ]
    },
    providers: [
      projectState,
      provideIcons({
        lucideList,
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
  { path: '', redirectTo: 'configs', pathMatch: 'full' },
  { path: '**', title: 'Page not found', component: NotFoundPage }
];
