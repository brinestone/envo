import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.signedIn$.pipe(
    map(signedIn => signedIn ? true : router.parseUrl(`/auth/sign-in?continue=${state.url}`))
  );
};
