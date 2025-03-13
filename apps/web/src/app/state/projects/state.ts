import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from "@angular/core";
import { DetailedProject } from "@models/project";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { patch, updateItem } from "@ngxs/store/operators";
import { ProjectsService } from "@services/projects.service";
import { SignedOut } from "@state/user";
import { NewProject, SelectionChanged, SelectProject, ToggleEnvironment } from "./actions";
import { EMPTY, tap } from "rxjs";

export type StateModel = {
    selectedProject?: {
        id: string;
        data: DetailedProject;
    };
};
export const PROJECTS = new StateToken<StateModel>('projects');

type Context = StateContext<StateModel>;
const defaultStateValue: StateModel = {};

@State({
    name: PROJECTS,
    defaults: defaultStateValue
})
@Injectable()
class ProjectsState {

    private projectsService = inject(ProjectsService);

    @Action(ToggleEnvironment)
    onToggleEnvironment(ctx: Context, { id, project }: ToggleEnvironment) {
        return this.projectsService.toggleEnvironment(project, id).pipe(
            tap(res => ctx.setState(patch({
                selectedProject: patch({
                    data: patch({
                        environments: updateItem(el => el.id == id, res)
                    })
                })
            })))
        );
    }

    @Action(SelectProject)
    onSelectProject(ctx: Context, { id }: SelectProject) {
        if (id) {
            return this.projectsService.findProjectById(id).pipe(
                tap((project) => {
                    ctx.setState(patch({
                        selectedProject: {
                            id, data: project
                        }
                    }));
                    ctx.dispatch(SelectionChanged);
                })
            );
        } else {
            ctx.setState(patch({
                selectedProject: undefined
            }));
            ctx.dispatch(SelectionChanged);
            return EMPTY;
        }
    }

    @Action(NewProject)
    onNewProject(_: Context, { name }: NewProject) {
        return this.projectsService.createProject(name);
    }

    @Action(SignedOut)
    onSignedOut(ctx: Context) {
        ctx.setState(defaultStateValue);
    }

}

export function provideProjectState(...features: EnvironmentProviders[]): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideStates([ProjectsState], ...features)
    ]);
}