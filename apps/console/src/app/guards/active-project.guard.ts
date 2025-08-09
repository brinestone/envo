import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { SelectProject } from "@state/project/actions";
import { currentProject } from "@state/selectors";
import { map } from "rxjs";

export const hasActiveProjectGuard: (redirect: string) => CanActivateFn = (redirect: string) => (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const http = inject(HttpClient);
  const activeProject = store.selectSnapshot(currentProject);
  if (activeProject) {
    return http.get<{ exists: boolean }>(`/api/projects/exists/${activeProject}`).pipe(
      map(({ exists }) => {
        if (exists) return true;
        store.dispatch(new SelectProject(null));
        return router.createUrlTree([redirect], { queryParamsHandling: 'preserve' })
      })
    )
  }
  return router.createUrlTree([redirect], {
    queryParamsHandling: 'preserve'
  })
}
