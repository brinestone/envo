import {
  assertInInjectionContext,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { createAuthClient } from 'better-auth/client';
import { inferAdditionalFields } from 'better-auth/client/plugins';
export * from './types';

function makeAuthClient(baseUrl: string) {
  return createAuthClient({
    plugins: [
      inferAdditionalFields({
        session: {
          activeOrganizationId: { type: 'string', required: false },
          activeProjectId: {
            type: 'string',
            required: false,
          },
        },
      }),
    ],
    baseURL: baseUrl,
  });
}
const BETTER_AUTH = new InjectionToken<ReturnType<typeof makeAuthClient>>('better-auth');
export function provideBetterAuth(baseURL: string) {
  return makeEnvironmentProviders([
    {
      provide: BETTER_AUTH,
      multi: false,
      useValue: makeAuthClient(baseURL),
    },
  ]);
}

export function injectAuthClient() {
  assertInInjectionContext(injectAuthClient);
  return inject(BETTER_AUTH);
}
