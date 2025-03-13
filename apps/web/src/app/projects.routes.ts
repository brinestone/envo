import { Routes } from "@angular/router";

export const projectRoutes: Routes = [
    {
        path: '', pathMatch: 'full', loadComponent: () => import('./pages/project-page/project-page.component').then(m => m.ProjectPageComponent)
    },
    { title: 'Environment', path: 'environments/:env', loadComponent: () => import('./pages/environment-page/environment-page.component').then(m => m.EnvironmentPageComponent) },
]