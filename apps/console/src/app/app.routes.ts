import { Routes } from '@angular/router';
import { NotFoundPage } from './pages/not-found/not-found.page';
import { AboutPage } from './pages/about/about.page';

export const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes), loadComponent: () => import('./layouts/auth/auth.layout').then(m => m.AuthLayout) },
  { path: 'about', title: 'About', component: AboutPage },
  { path: '**', title: 'Page not found', component: NotFoundPage }
];
