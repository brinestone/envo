import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { NavigationCancel, provideRouter, withViewTransitions } from '@angular/router';
import { withNgxsLoggerPlugin } from '@ngxs/logger-plugin';
import {
  Navigate,
  NavigationActionTiming,
  RouterNavigated,
  withNgxsRouterPlugin,
} from '@ngxs/router-plugin';
import { SESSION_STORAGE_ENGINE, withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';

import { provideBetterAuth } from '@libs/auth';
import { provideSpartanHlm } from '@spartan/ui/utils';
import { AUTH_STATE, AuthStore } from '@store/auth';
import { OrgStore } from '@store/organization';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { apiBaseInterceptor } from './interceptors/api-base-interceptor';
import { apiErrorInterceptor } from './interceptors/api-error-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),
    provideClientHydration(),
    provideHttpClient(withInterceptors([apiErrorInterceptor, apiBaseInterceptor])),
    provideBetterAuth(environment.apiOrigin),
    provideSpartanHlm(),
    provideStore(
      [AuthStore, OrgStore],
      withNgxsLoggerPlugin({
        disabled: !isDevMode(),
        filter: (action) =>
          !(action instanceof Navigate) &&
          !(action instanceof NavigationCancel) &&
          !(action instanceof RouterNavigated),
      }),
      withNgxsRouterPlugin({ navigationActionTiming: NavigationActionTiming.PreActivation }),
      withNgxsStoragePlugin({
        keys: [{ key: AUTH_STATE, engine: SESSION_STORAGE_ENGINE }],
        namespace: 'envo',
      }),
    ),
  ],
};
