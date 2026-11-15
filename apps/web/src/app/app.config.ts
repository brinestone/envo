import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withViewTransitions } from "@angular/router";
import { withNgxsLoggerPlugin } from "@ngxs/logger-plugin";
import { NavigationActionTiming, withNgxsRouterPlugin } from "@ngxs/router-plugin";
import { SESSION_STORAGE_ENGINE, withNgxsStoragePlugin } from "@ngxs/storage-plugin";
import { provideStore } from "@ngxs/store";

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideClientHydration } from "@angular/platform-browser";

import { provideBetterAuth } from "@libs/auth";
import { AUTH_STATE, AuthStore } from "@store/auth";
import { environment } from "../environments/environment";
import { routes } from "./app.routes";
import { apiBaseInterceptor } from "./interceptors/api-base-interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),
    provideClientHydration(),
    provideHttpClient(withInterceptors([apiBaseInterceptor])),
    provideBetterAuth(environment.apiOrigin),
    provideStore(
      [AuthStore],
      withNgxsLoggerPlugin({ disabled: !isDevMode() }),
      withNgxsRouterPlugin({ navigationActionTiming: NavigationActionTiming.PreActivation }),
      withNgxsStoragePlugin({
        keys: [{ key: AUTH_STATE, engine: SESSION_STORAGE_ENGINE }],
        namespace: "envo",
      }),
    ),
  ],
};
