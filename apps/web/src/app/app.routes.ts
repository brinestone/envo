import { Routes } from '@angular/router';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { authGuard } from './gurads/auth.guard';

export const routes: Routes = [
    { path: 'auth', loadChildren: () => import('./pages/auth/auth.routes').then(m => m.authRoutes) },
    {
        canActivate: [authGuard],
        title: 'Dashboard',
        path: '', pathMatch: 'full',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    { path: '**', component: NotFoundComponent }
];
