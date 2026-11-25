import { Routes } from '@angular/router';

export const mainRoutes: Routes = [
  {
    path: 'projects',
    title: 'Projects',
    loadComponent: () =>
      import('./pages/console/projects/projects.page').then((m) => m.ProjectsPage),
  },
  {
    path: 'overview',
    title: 'Overview',
    loadComponent: () =>
      import('./pages/console/overview/overview.page').then((m) => m.OverviewPage),
  },
  {
    path: 'new-org',
    title: 'New Organization',
    loadComponent: () =>
      import('./dialogs/new-organization/new-organization.dialog').then(
        (m) => m.NewOrganizationDialog,
      ),
    outlet: 'dialog',
  },
  { path: '', pathMatch: 'full', redirectTo: 'overview' },
];
