import { Routes } from '@angular/router';
import { NotFoundPage } from './pages/not-found/not-found.page';
import { AboutPage } from './pages/about/about.page';
import { signedInGuard } from './guards/signed-in';

const authGuard = signedInGuard('/auth');

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes),
    loadComponent: () => import('./layouts/auth/auth.layout').then(m => m.AuthLayout)
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/project/project.layout').then(m => m.ProjectLayout),
    loadChildren: () => import('./project.routes').then(m => m.projectRoutes),
  },
  { path: 'about', title: 'About', component: AboutPage },
  { path: '', redirectTo: 'projects', pathMatch: 'full' },
  { path: '**', title: 'Page not found', component: NotFoundPage }
];
