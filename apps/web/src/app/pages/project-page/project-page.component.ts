import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, model, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NewEnvironmentFormComponent } from '@components/new-environment-form';
import { Navigate } from '@ngxs/router-plugin';
import { dispatch, select } from '@ngxs/store';
import { SelectProject, ToggleEnvironment } from '@state/projects';
import { activeProjectInfo, environments } from '@state/selectors';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { InputText } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-project-page',
  imports: [Divider, FormsModule, DatePipe, DecimalPipe, ToggleSwitch, RouterLink, TableModule, Panel, Button, InputText, FormsModule, NewEnvironmentFormComponent, DialogModule],
  templateUrl: './project-page.component.html',
  styleUrl: './project-page.component.scss'
})
export class ProjectPageComponent implements OnInit, OnDestroy {
  readonly title = inject(Title);
  readonly id = input<string>();
  readonly environments = select(environments);
  readonly selectedProject = select(activeProjectInfo);
  readonly showNewEnvironmentFormDialog = model(true);
  private readonly selectProject = dispatch(SelectProject);
  private navigate = dispatch(Navigate);
  private toggleEnvironment = dispatch(ToggleEnvironment);
  readonly route = inject(ActivatedRoute);

  onEnvironmentStatusToggled(id: string) {
    this.toggleEnvironment(id, this.id() as string);
  }

  onEnvironmentCreated(id: string) {
    this.showNewEnvironmentFormDialog.set(false);
    this.navigate(['./environments', id], undefined, { relativeTo: this.route });
  }

  onNewEnvironmentFormErrored(e: Error) {
    console.error(e);
  }

  onNewEnvronmentButtonClicked() {
    this.showNewEnvironmentFormDialog.set(true);
  }

  ngOnInit() {
    const id = this.id() as string;
    this.selectProject(id);
  }

  ngOnDestroy() {
    this.selectProject();
  }

  constructor() {
    effect(() => {
      const info = this.selectedProject();
      console.log(info);
      this.title.setTitle(`${info?.name ?? ''}`);
    });
  }
}
