import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { environment } from '@env/environment.development';
import { createAuthClient } from 'better-auth/client';

let client = createAuthClient({
    baseURL: environment.apiOrigin
});

export const BETTER_AUTH = new InjectionToken<typeof client>('BETTER_AUTH_CLIENT');

export function provideBetterAuth(url: string): EnvironmentProviders {
    client = createAuthClient({ baseURL: url })
    return makeEnvironmentProviders([
        {
            provide: BETTER_AUTH,
            useValue: client,
            multi: false
        },
    ])
}