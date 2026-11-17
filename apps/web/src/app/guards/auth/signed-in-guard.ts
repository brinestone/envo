import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { injectAuthClient } from '@libs/auth';
import { Store } from '@ngxs/store';
import { signedIn } from '@store/selectors';

export const signedInGuard: (redirect: string) => CanActivateFn =
  (redirect: string) => async (route, state) => {
    const platform = inject(PLATFORM_ID);
    const authClient = injectAuthClient();
    const store = inject(Store);
    const router = inject(Router);
    const tree = router.createUrlTree([redirect], {
      queryParams: {
        continue: encodeURIComponent(state.url),
      },
      queryParamsHandling: 'merge',
    });
    if (isPlatformServer(platform)) {
      const request = inject(REQUEST, { optional: true });
      if (request) {
        const { data, error } = await authClient.getSession({
          fetchOptions: { headers: request.headers },
        });
        if (error) {
          console.error(error);
        } else if (data) {
          return true;
        }
      }
      return tree;
    } else {
      const isSignedIn = store.selectSnapshot(signedIn);
      if (!isSignedIn) return tree;
    }
    return true;
  };
