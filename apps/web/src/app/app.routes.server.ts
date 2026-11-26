import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'auth/login',
    renderMode: RenderMode.Server,
  },
  { path: 'auth/register', renderMode: RenderMode.Server },
  {
    path: 'auth/oauth-callback',
    renderMode: RenderMode.Server,
  },
  {
    path: 'console/*',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
