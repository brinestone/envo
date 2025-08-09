import { Routes } from "@angular/router";

export const projectRoutes: Routes = [
  { path: '', pathMatch: 'full', title: 'Projects', loadComponent: () => import('./pages/project/all-projects/all-projects.page').then(m => m.AllProjectsPage) },
];
