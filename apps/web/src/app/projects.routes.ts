import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, Routes } from "@angular/router";
import { Store } from "@ngxs/store";
import { SelectEnvironment } from "@state/projects";
import { EnvironmentPageComponent } from "./pages/environment-page/environment-page.component";

const environmentDeactivatorGuard = (route: ActivatedRouteSnapshot) => {
    const store = inject(Store);
    store.dispatch(new SelectEnvironment());
    return true;
};

const environmentActivatorGuard = (route: ActivatedRouteSnapshot) => {
    const store = inject(Store);
    const environment = route.params['env'] as string;
    store.dispatch(new SelectEnvironment(environment));
    return true;
}

export const projectRoutes: Routes = [
    {
        path: '', pathMatch: 'full', loadComponent: () => import('./pages/project-page/project-page.component').then(m => m.ProjectPageComponent)
    },
    {
        canActivate: [environmentActivatorGuard],
        canDeactivate: [environmentDeactivatorGuard],
        title: 'Environment',
        path: 'environments/:env',
        loadComponent: () => import('./pages/environment-page/environment-page.component').then(m => m.EnvironmentPageComponent),
        children: [
            { path: 'features', loadComponent: () => import('./pages/features-page/features-page.component').then(m => m.FeaturesPageComponent) },
            { path: 'config', loadComponent: () => import('./pages/configurations-page/configurations-page.component').then(m => m.ConfigurationsPageComponent) },
            { path: '', pathMatch: 'full', redirectTo: 'features' },
        ]
    }
]