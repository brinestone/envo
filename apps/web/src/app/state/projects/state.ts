import { EnvironmentProviders, inject, Injectable, makeEnvironmentProviders } from "@angular/core";
import { DetailedEnvironment, DetailedProject, EnvironmentVersion } from "@models/project";
import { Action, provideStates, State, StateContext, StateToken } from "@ngxs/store";
import { append, patch, updateItem } from "@ngxs/store/operators";
import { ProjectsService } from "@services/projects.service";
import { SignedOut } from "@state/user";
import { EMPTY, forkJoin, tap } from "rxjs";
import { CreateEnvironmentVersion, EnvironmentSelectionChanged, NewProject, ProjectSelectionChanged, SelectEnvironment, SelectProject, SetActiveEnvironmentVersion, ToggleEnvironment } from "./actions";

export type StateModel = {
    selectedProject?: {
        id: string;
        data: DetailedProject;
    };
    selectedEnvironment?: {
        id: string;
        data: DetailedEnvironment;
        versions: EnvironmentVersion[];
    }
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

    @Action(SetActiveEnvironmentVersion)
    onSetActiveEnvironmentVersion(ctx: Context, { name, env, project }: SetActiveEnvironmentVersion) {
        return this.projectsService.setActiveEnvironmentVersion(project, env, name).pipe(
            tap(ev => ctx.setState(patch({
                selectedEnvironment: patch({
                    versions: ev
                })
            })))
        );
    }

    @Action(CreateEnvironmentVersion)
    onCreateEnvironmentVersion(ctx: Context, { environment, makeActive, project, label }: CreateEnvironmentVersion) {
        return this.projectsService.createEnvironmentVersion(project, environment, makeActive, label).pipe(
            tap(ev => ctx.setState(patch({
                selectedEnvironment: patch({
                    versions: append([ev])
                })
            })))
        )
    }

    @Action(SelectEnvironment)
    onSelectEnvironment(ctx: Context, { id }: SelectEnvironment) {
        const project = ctx.getState().selectedProject?.id;
        if (!project) return EMPTY;

        if (id) {
            return forkJoin([
                this.projectsService.findEnvironmentById(project, id),
                this.projectsService.getEnvironmentVersions(project, id)
            ]).pipe(
                tap(([data, versions]) => ctx.setState(patch({
                    selectedEnvironment: {
                        id, data, versions
                    }
                }))),
                tap(() => ctx.dispatch(EnvironmentSelectionChanged))
            );
        } else {
            ctx.setState(patch({
                selectedEnvironment: undefined
            }));
            ctx.dispatch(EnvironmentSelectionChanged);
        }

        return EMPTY;
    }

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
                    ctx.dispatch(ProjectSelectionChanged);
                })
            );
        } else {
            ctx.setState(patch({
                selectedProject: undefined
            }));
            ctx.dispatch(ProjectSelectionChanged);
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