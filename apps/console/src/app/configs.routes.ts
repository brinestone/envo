import { Routes } from "@angular/router";

export const configRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/config-page/config-page.layout').then(m => m.ConfigPageLayout), children: [
      { path: 'flags', title: 'Features', loadComponent: () => import('./pages/configs/feature-flags/feature-flags.page').then(m => m.FeatureFlagsPage) },
      { path: 'env', title: 'Environment Variables', loadComponent: () => import('./pages/configs/env-variables/env-variables.page').then(m => m.EnvVariablesPage) },
      { path: '', pathMatch: 'full', redirectTo: 'flags' }
    ]
  }
];
