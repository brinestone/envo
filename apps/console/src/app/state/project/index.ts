import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from "@angular/core";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { ProjectService } from "@services/project";
import { tap } from "rxjs";
import { ProjectStateModel } from "../../../models";
import { CreateProject, SelectProject } from "./actions";
import { patch } from "@ngxs/store/operators";
import { SignedOut } from "@state/auth/actions";

export const PROJECTS = new StateToken<ProjectStateModel>('projects');
type Context = StateContext<ProjectStateModel>;

@State({
  name: PROJECTS,
  defaults: {}
})
@Injectable()
class ProjectState {
  private projectService = inject(ProjectService);

  @Action(SignedOut)
  onSignedOut(ctx: Context) {
    ctx.setState({});
  }

  @Action(SelectProject, { cancelUncompleted: true })
  onSelectProject(ctx: Context, { id }: SelectProject) {
    ctx.setState(patch({ activeProject: id ?? undefined }));
  }

  @Action(CreateProject, { cancelUncompleted: true })
  onCreateProject(ctx: Context, { name, org }: CreateProject) {
    return this.projectService.createProject(name, org).pipe(
      tap((project) => ctx.setState({
        activeProject: project.id
      }))
    )
  }
}

export function provideProjectState(...providers: EnvironmentProviders[]) {
  return makeEnvironmentProviders([
    provideStates([ProjectState], ...providers)
  ]);
}
