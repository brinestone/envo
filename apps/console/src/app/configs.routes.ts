import { Routes } from "@angular/router";
import { checkPendingChangesGuard } from "./guards/check-pending-changes.guard";

export const configRoutes: Routes = [
  { title: 'Clients', path: 'clients', loadComponent: () => import('./pages/client/client.page').then(m => m.ClientsPage) },
  {
    path: 'configs',
    loadComponent: () => import('./layouts/config-page/config-page.layout').then(m => m.ConfigPageLayout), children: [
      { canDeactivate: [checkPendingChangesGuard], path: 'flags', title: 'Features', loadComponent: () => import('./pages/configs/feature-flags/feature-flags.page').then(m => m.FeatureFlagsPage) },
      { canDeactivate: [checkPendingChangesGuard], path: 'vars', title: 'Environment Variables', loadComponent: () => import('./pages/configs/env-variables/env-variables.page').then(m => m.EnvVariablesPage) },
      { path: '', pathMatch: 'full', redirectTo: 'flags' }
    ]
  },
  { path: '', pathMatch: 'full', redirectTo: 'configs' }
];
