import { HttpClient } from "@angular/common/http";
import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { Store } from "@ngxs/store";
import { SelectProject } from "@state/project/actions";
import { currentProject } from "@state/selectors";
import { map } from "rxjs";
import { environment } from "../../environments/environment.development";

export const hasActiveProjectGuard: (redirect: string) => CanActivateFn = (redirect: string) => (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const redirectTree = router.createUrlTree([redirect], { queryParamsHandling: 'preserve' });
  const http = inject(HttpClient);
  const activeProject = store.selectSnapshot(currentProject);
  if (activeProject) {
    return http.get<{ exists: boolean }>(`${environment.apiBaseUrl}/projects/exists/${activeProject}`).pipe(
      map(({ exists }) => {
        if (exists) return true;
        store.dispatch(new SelectProject(null));
        return redirectTree;
      })
    )
  }
  return redirectTree;
}
