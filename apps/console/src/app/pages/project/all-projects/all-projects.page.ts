import { httpResource } from '@angular/common/http';
import { Component, model } from '@angular/core';
import { NewProjectForm, Submission } from '@components/new-project-form';
import { Project } from "@envo/dto";
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideOctagonAlert, lucidePlus } from '@ng-icons/lucide';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSheetContentDirective, BrnSheetTriggerDirective } from '@spartan-ng/brain/sheet';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmSheetModule } from '@spartan-ng/helm/sheet';
import { HlmSkeletonModule } from '@spartan-ng/helm/skeleton';
import { CreateProject, SelectProject } from '@state/project/actions';
import { activeOrganization } from '@state/selectors';
import { toast } from 'ngx-sonner';
import { concatMap } from 'rxjs';
import { isActionLoading } from '../../../utils';

@Component({
  viewProviders: [
    provideIcons({
      lucidePlus,
      lucideCheck,
      lucideOctagonAlert
    })
  ],
  selector: 'ev-all-projects',
  imports: [
    HlmSkeletonModule,
    HlmCardImports,
    BrnSheetContentDirective,
    BrnSheetTriggerDirective,
    HlmBadgeImports,
    HlmButtonDirective,
    HlmSheetModule,
    NewProjectForm,
    NgIcon
  ],
  templateUrl: './all-projects.page.html',
  styleUrl: './all-projects.page.scss'
})
export class AllProjectsPage {
  showNewProjectForm = model<BrnDialogState>('closed');
  private currentOrg = select(activeOrganization);
  private createProject = dispatch(CreateProject);
  private navigate = dispatch(Navigate);
  private selectProject = dispatch(SelectProject);
  readonly creatingProject = isActionLoading(CreateProject);
  readonly projects = httpResource<Project[]>(() => `/api/projects?org=${this.currentOrg()}`, { defaultValue: [] });
  onNewProject({ name }: Submission) {
    this.createProject(name, this.currentOrg()!).subscribe({
      error: (e: Error) => {
        toast.error('Could not create project', { description: e.message });
      },
      complete: () => {
        this.showNewProjectForm.set('closed');
        this.projects.reload();
      }
    })
  }

  onProjectNameClicked(id: string) {
    this.selectProject(id).pipe(
      concatMap(() => this.navigate(['/configs'], undefined, { queryParamsHandling: 'preserve' }))
    ).subscribe();
  }
}
