import { inject, Injectable, makeEnvironmentProviders } from '@angular/core';
import { ProjectLookupOutput } from '@envo/api/models';
import { ProjectService } from '@envo/api/services';
import { LOCAL_STORAGE_ENGINE, withStorageFeature } from '@ngxs/storage-plugin';
import { Action, NgxsOnInit, provideStates, State, StateContext, StateToken } from '@ngxs/store';
import { patch } from '@ngxs/store/operators';
import { RefreshSession, SessionRefreshed, SignOut } from '@store/auth';
import { tap } from 'rxjs';
import { CreateProject, LoadProjects, SetActiveProject } from './actions';

export type ProjectStoreModel = {
  projects: ProjectLookupOutput[];
  active: string | null;
};

const defaultStoreValue: ProjectStoreModel = {
  active: null,
  projects: [],
};

type Context = StateContext<ProjectStoreModel>;
export const PROJECT_STORE = new StateToken<ProjectStoreModel>('projects');
@State({ name: PROJECT_STORE, defaults: defaultStoreValue })
@Injectable({ providedIn: null })
class ProjectStore implements NgxsOnInit {
  ngxsOnInit(ctx: Context): void {
    ctx.dispatch(LoadProjects);
  }
  private readonly projectService = inject(ProjectService);

  @Action(SignOut)
  onSignOut(ctx: Context) {
    ctx.setState(defaultStoreValue);
  }

  @Action(SessionRefreshed)
  onSessionRefreshed(ctx: Context, action: SessionRefreshed) {
    ctx.setState(patch({ active: action.session.activeProjetId }));
  }

  @Action(CreateProject)
  onCreateProject(ctx: Context, action: CreateProject) {
    return this.projectService
      .createOrganizationProject({
        name: action.name,
        slug: action.slug,
        image: action.image,
      })
      .pipe(tap(() => ctx.dispatch([RefreshSession, LoadProjects])));
  }

  @Action(SetActiveProject)
  onSetActieProject(ctx: Context, { id }: SetActiveProject) {
    return this.projectService
      .setActiveOrganizationProject({
        project: id,
      })
      .pipe(tap(() => ctx.dispatch([RefreshSession, LoadProjects])));
  }

  @Action(LoadProjects, { cancelUncompleted: true })
  onLoadProjects(ctx: Context) {
    return this.projectService.lookupOrganizationProjects({ size: 9999 }).pipe(
      tap(({ data }) =>
        ctx.setState(
          patch({
            projects: data,
          }),
        ),
      ),
    );
  }
}

export function provideProjectStore() {
  return makeEnvironmentProviders([
    provideStates(
      [ProjectStore],
      withStorageFeature([{ key: PROJECT_STORE, engine: LOCAL_STORAGE_ENGINE }]),
    ),
  ]);
}
