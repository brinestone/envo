import { ActivatedRouteSnapshot, RouterStateSnapshot, Routes } from '@angular/router';
import { SESSION_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { PROJECTS, provideProjectState, SelectProject } from '@state/projects';
import { authGuard } from './gurads/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { inject } from '@angular/core';
import { Store } from '@ngxs/store';

const projectActivatorGuard = (route: ActivatedRouteSnapshot) => {
    const store = inject(Store);
    const projectId = route.params['project'] as string;
    store.dispatch(new SelectProject(projectId));
    return true;
};

const projectDeactivatorGuard = (route: ActivatedRouteSnapshot) => {
    const store = inject(Store);
    store.dispatch(new SelectProject());
    return true;
}

const projectProvider = provideProjectState(withStorageFeature([{
    engine: SESSION_STORAGE_ENGINE,
    key: PROJECTS
}]));

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./auth.routes').then(m => m.authRoutes) },
    {
        providers: [projectProvider],
        canActivate: [authGuard],
        title: 'Projects',
        path: 'projects',
        loadComponent: () => import('./pages/projects/projects.component').then(m => m.ProjectsComponent)
    },
    {
        providers: [projectProvider],
        canActivate: [authGuard, projectActivatorGuard],
        canDeactivate: [projectDeactivatorGuard],
        path: 'projects/:project',
        loadChildren: () => import('./projects.routes').then(m => m.projectRoutes)
    },
    { pathMatch: 'full', path: '', redirectTo: 'projects' },
    // { path: '**', component: NotFoundComponent }
];
