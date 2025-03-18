import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { LOCAL_STORAGE_ENGINE, withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { environment } from '@env/environment.development';
import { provideStore } from '@ngxs/store';
import { provideBetterAuth } from '@providers/better-auth';
import { USER_STATE, UserState } from '@state/user';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorParserInterceptor } from './interceptors/error-parser.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor, errorParserInterceptor]), withFetch()),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withViewTransitions(), withComponentInputBinding()),
    provideBetterAuth(environment.apiOrigin),
    provideStore([UserState],
      withNgxsRouterPlugin(),
      withNgxsLoggerPlugin({ disabled: !isDevMode() }),
      withNgxsStoragePlugin({ keys: [{ engine: LOCAL_STORAGE_ENGINE, key: USER_STATE }] }),
      withNgxsReduxDevtoolsPlugin({ disabled: !isDevMode() })
    ),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
};
