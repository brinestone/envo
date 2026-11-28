import { isPlatformServer } from '@angular/common';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { injectAuthClient } from '@libs/auth';
import { Store } from '@ngxs/store';
import { activeOrg } from '@store/selectors';

export const requireActiveOrgGuard: (redirect: string) => CanActivateFn =
  (redirect: string) => async () => {
    const router = inject(Router);
    const platform = inject(PLATFORM_ID);
    const redirectTree = router.createUrlTree([redirect]);
    if (isPlatformServer(platform)) {
      const request = inject(REQUEST, { optional: true });
      if (request) {
        const headers = request.headers;
        const authClient = injectAuthClient();
        const { data, error } = await authClient.getSession({ fetchOptions: { headers } });
        if (error) {
          console.error(error);
          return redirectTree;
        }

        if (!data) return redirectTree;
        return data.session.activeOrganizationId ? true : redirectTree;
      }
      return redirectTree;
    } else {
      const store = inject(Store);
      const active = store.selectSnapshot(activeOrg);
      return active ? true : redirectTree;
    }
  };
