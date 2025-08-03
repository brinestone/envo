import { StateContext, StateToken, State, provideStates } from "@ngxs/store";
import { ProjectStateModel } from "../../../models";
import { EnvironmentProviders, Injectable, makeEnvironmentProviders } from "@angular/core";

export const PROJECTS = new StateToken<ProjectStateModel>('projects');
type Context = StateContext<ProjectStateModel>;

@State({
  name: PROJECTS,
  defaults: {}
})
@Injectable()
class ProjectState {

}

export function provideProjectState(...providers: EnvironmentProviders[]) {
  return makeEnvironmentProviders([
    provideStates([ProjectState], ...providers)
  ]);
}
