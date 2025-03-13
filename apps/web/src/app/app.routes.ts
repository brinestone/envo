import { Routes } from '@angular/router';
import { SESSION_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { PROJECTS, provideProjectState } from '@state/projects';
import { authGuard } from './gurads/auth.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./auth.routes').then(m => m.authRoutes) },
    {
        providers: [
            provideProjectState(withStorageFeature([{
                engine: SESSION_STORAGE_ENGINE,
                key: PROJECTS
            }]))
        ],
        canActivate: [authGuard],
        path: 'projects',
        loadChildren: () => import('./projects.routes').then(m => m.projectRoutes)
    },
    { pathMatch: 'full', path: '', redirectTo: 'projects' },
    { path: '**', component: NotFoundComponent }
];
