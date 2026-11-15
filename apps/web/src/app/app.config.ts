import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withViewTransitions } from "@angular/router";

import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideClientHydration } from "@angular/platform-browser";
import { provideBetterAuth } from "@libs/auth";
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
  ],
};
