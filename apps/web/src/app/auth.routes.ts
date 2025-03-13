import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    { path: 'sign-in', title: 'Sign into your Account', loadComponent: () => import('./pages/auth/sign-in/sign-in.component').then(m => m.SignInComponent) },
    { path: 'sign-up', title: 'Create your own Account', loadComponent: () => import('./pages/auth/sign-up/sign-up.component').then(m => m.SignUpComponent) }
]