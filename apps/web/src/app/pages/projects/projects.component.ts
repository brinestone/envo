import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, model, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NewFormSubmission, NewProjectFormComponent } from '@components/new-project-form';
import { environment } from '@env/environment.development';
import { Actions, dispatch, ofActionCompleted, ofActionDispatched } from '@ngxs/store';
import { NewProject } from '@state/projects';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Panel } from 'primeng/panel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { map, merge } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [Button, NewProjectFormComponent, ProgressSpinnerModule, TableModule, Panel, DialogModule, DatePipe, RouterLink],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent {
  title = inject(Title);
  private http = inject(HttpClient);
  private actions$ = inject(Actions);
  readonly ownedProjects = rxResource({
    loader: () => this.http.get<any[]>(`${environment.apiBase}/projects`)
  })
  private newProject = dispatch(NewProject);
  readonly showNewProjectDialog = model(false);
  readonly newProjectError = signal('');
  readonly creatingNewProject = toSignal(merge(
    this.actions$.pipe(ofActionDispatched(NewProject), map(() => true)),
    this.actions$.pipe(ofActionCompleted(NewProject), map(() => false))
  ))

  onNewProjectButtonClicked() {
    this.showNewProjectDialog.set(true);
  }

  onNewProjectFormSubmitted(event: NewFormSubmission) {
    this.newProjectError.set('');
    this.newProject(event.name).subscribe({
      error: (error: Error) => {
        this.newProjectError.set(error.message);
      },
      complete: () => {
        this.showNewProjectDialog.set(false);
        this.ownedProjects.reload();
      }
    })
  }
}
