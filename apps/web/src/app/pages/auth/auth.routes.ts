import { Routes } from "@angular/router";

export const authRoutes: Routes = [
    { path: 'sign-in', title: 'Sign into your Account', loadComponent: () => import('./sign-in/sign-in.component').then(m => m.SignInComponent) },
    { path: 'sign-up', title: 'Create your own Account', loadComponent: () => import('./sign-up/sign-up.component').then(m => m.SignUpComponent) }
]