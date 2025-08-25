import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { isUserSignedIn } from "@state/selectors";

export const signedInGuard: (redirect: string) => CanActivateFn = (redirect: string) => (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const signedIn = store.selectSnapshot(isUserSignedIn);
  if (signedIn) return true;
  return router.createUrlTree([redirect], {
    queryParams: {
      'continue': encodeURIComponent(state.url)
    },
    queryParamsHandling: 'merge'
  })
}
