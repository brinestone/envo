import { Routes } from "@angular/router";

export const projectRoutes: Routes = [
    {
        path: '', title: 'Projects',
        pathMatch: 'full',
        loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent)
    },
    {
        path: ':id', pathMatch: 'full', loadComponent: () => import('./pages/project-page/project-page.component').then(m => m.ProjectPageComponent), children: [
            { path: 'environments/:id', loadComponent: () => import('./pages/environment-page/environment-page.component').then(m => m.EnvironmentPageComponent) },
        ]
    }
]