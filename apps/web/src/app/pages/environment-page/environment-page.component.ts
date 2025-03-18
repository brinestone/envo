import { Component, inject, input, linkedSignal, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { NewEnvironmentVersionFormComponent } from '@components/new-environment-version-form/new-environment-version-form.component';
import { EnvironmentVersion } from '@models/project';
import { dispatch, select } from '@ngxs/store';
import { SetActiveEnvironmentVersion, ToggleEnvironment } from '@state/projects';
import { environmentVersions, selectedEnvironment } from '@state/selectors';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Panel } from 'primeng/panel';
import { Select } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { ToggleButton } from 'primeng/togglebutton';
import { errorToast, toastMessage } from 'src/app/utils';

const updateSavedMessage = toastMessage('Changes Saved', { severity: 'success' });

@Component({
  selector: 'app-environment-page',
  imports: [Panel, Select, RouterOutlet, RouterLink, TabsModule, ToggleButton, FormsModule, Button, DialogModule, NewEnvironmentVersionFormComponent],
  templateUrl: './environment-page.component.html',
  styleUrl: './environment-page.component.scss'
})
export class EnvironmentPageComponent {

  private toggleEnvironment = dispatch(ToggleEnvironment);
  private setActiveVersion = dispatch(SetActiveEnvironmentVersion);
  private ms = inject(MessageService);
  readonly environment = select(selectedEnvironment);
  readonly versions = select(environmentVersions);
  readonly enabledState = linkedSignal(() => this.environment()?.enabled);
  readonly activeVersion = linkedSignal(() => this.versions().find(e => e.isActive));
  readonly env = input<string>();
  readonly project = input<string>();
  readonly title = inject(Title);
  readonly route = inject(ActivatedRoute);
  readonly showNewVersionFormDialog = model(false);

  onNewVersionFormSubmitted() {
    this.showNewVersionFormDialog.set(false);
  }

  onEnabledStateChanged() {
    this.toggleEnvironment(this.env() as string, this.project() as string).subscribe({
      error: (error: Error) => {
        this.ms.add(errorToast(error));
      },
      complete: () => {
        this.ms.add(updateSavedMessage);
      }
    });
  }

  onActiveVersionChanged({ label }: EnvironmentVersion) {
    this.setActiveVersion(label, this.project() as string, this.env() as string).subscribe({
      error: (error: Error) => {
        this.ms.add(errorToast(error));
      },
      complete: () => {
        this.ms.add(updateSavedMessage);
      }
    })
  }

}
