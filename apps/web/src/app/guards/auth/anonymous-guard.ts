import { isPlatformServer } from "@angular/common";
import { inject, PLATFORM_ID, REQUEST } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { injectAuthClient } from "@libs/auth";
import { Store } from "@ngxs/store";
import { signedIn } from "@store/selectors";

export const anonymousGuard: (redirect: string) => CanActivateFn =
  (redirect: string) => async () => {
    const platformId = inject(PLATFORM_ID);
    const router = inject(Router);
    const tree = router.createUrlTree([redirect]);
    const store = inject(Store);
    if (isPlatformServer(platformId)) {
      const request = inject(REQUEST, { optional: true });
      if (request) {
        const authClient = injectAuthClient();
        const { data, error } = await authClient.getSession({
          fetchOptions: { headers: request.headers },
        });

        if (error) {
          console.error(error);
        }
        if (data) {
          return tree;
        }
      }
    } else {
      const isAuthed = store.selectSnapshot(signedIn);
      if (isAuthed) return tree;
    }
    return true;
  };
