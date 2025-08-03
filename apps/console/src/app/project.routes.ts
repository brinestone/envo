import { Routes } from "@angular/router";

export const projectRoutes: Routes = [
  { path: 'all', title: 'Projects', loadComponent: () => import('./pages/project/all-projects/all-projects.page').then(m => m.AllProjectsPage) },
  { path: '', redirectTo: 'all', pathMatch: 'full' }
];
