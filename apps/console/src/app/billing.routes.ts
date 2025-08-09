import { Routes } from "@angular/router";

export const billingRoutes: Routes = [
  { title: 'Billing', path: '', pathMatch: 'full', loadComponent: () => import('./pages/billing/index/index.page').then(m => m.IndexPage) }
]
