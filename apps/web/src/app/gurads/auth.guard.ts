import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { isSignedIn } from '@state/selectors';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const result = store.selectSnapshot(isSignedIn);
  const res = result ? true : router.parseUrl(`/auth/sign-in?continue=${state.url}`);
  return res;
};
