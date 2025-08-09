import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { currentProject } from "@state/selectors";

export const hasActiveProjectGuard: (redirect: string) => CanActivateFn = (redirect: string) => (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const activeProject = store.selectSnapshot(currentProject);
  if (activeProject) return true;
  return router.createUrlTree([redirect], {
    queryParamsHandling: 'preserve'
  })
}
